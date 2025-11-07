import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import CodeIDEPanel from './components/CodeIDEPanel';
import SettingsPage from './components/SettingsPage';
import { Settings, Page, ChatSession, Message, CodeFile } from './types';
import { GoogleGenAI, Content } from '@google/genai';

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('gemini-user-api-key') || '';
    } catch {
      return '';
    }
  });
  const [apiKeyStatus, setApiKeyStatus] = useState<'unknown' | 'valid' | 'invalid' | 'checking'>('unknown');

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('gemini-chat-settings');
      return savedSettings ? JSON.parse(savedSettings) : {
        theme: 'dark',
        persona: '',
        context: 'You are a helpful AI assistant specializing in code generation.',
      };
    } catch {
      return {
        theme: 'dark',
        persona: '',
        context: 'You are a helpful AI assistant specializing in code generation.',
      };
    }
  });

  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const savedSessions = localStorage.getItem('gemini-chat-sessions');
      return savedSessions ? JSON.parse(savedSessions) : [];
    } catch {
      return [];
    }
  });
  
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    return localStorage.getItem('gemini-active-chat-id');
  });

  const [currentPage, setCurrentPage] = useState<Page>('chat');
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);

  // === Code IDE Panel State ===
  const [isCodePanelVisible, setIsCodePanelVisible] = useState(false);
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>(() => {
    try {
        const saved = localStorage.getItem('gemini-code-files');
        return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [activeCodeFileId, setActiveCodeFileId] = useState<string | null>(null);
  
  const ai = useMemo(() => {
    const keyToUse = apiKey || process.env.API_KEY;
    if (!keyToUse) {
      return null;
    }
    try {
        return new GoogleGenAI({ apiKey: keyToUse });
    } catch(e) {
        console.error("Error initializing GoogleGenAI, likely an invalid API Key format.", e);
        return null;
    }
  }, [apiKey]);

  // Debounced API Key validation
  useEffect(() => {
    if (!apiKey) {
      setApiKeyStatus('unknown');
      return;
    }

    setApiKeyStatus('checking');
    const handler = setTimeout(() => {
      const validateKey = async () => {
        try {
          const tempAi = new GoogleGenAI({ apiKey: apiKey });
          // A lightweight call to check validity.
          await tempAi.models.generateContent({model: 'gemini-2.5-flash', contents: 'test'});
          setApiKeyStatus('valid');
        } catch (error) {
          console.error("API Key validation failed:", error);
          setApiKeyStatus('invalid');
        }
      };
      validateKey();
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [apiKey]);


  useEffect(() => {
    try {
        localStorage.setItem('gemini-user-api-key', apiKey);
    } catch(e) {
        console.error("Could not save API key to local storage.", e);
    }
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('gemini-chat-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('gemini-chat-sessions', JSON.stringify(chatSessions));
  }, [chatSessions]);
  
  useEffect(() => {
    localStorage.setItem('gemini-code-files', JSON.stringify(codeFiles));
  }, [codeFiles]);

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('gemini-active-chat-id', activeChatId);
    } else {
      localStorage.removeItem('gemini-active-chat-id');
    }
  }, [activeChatId]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
    const darkTheme = document.getElementById('hljs-theme-dark') as HTMLLinkElement;
    const lightTheme = document.getElementById('hljs-theme-light') as HTMLLinkElement;
    if (settings.theme === 'dark') {
      darkTheme.disabled = false;
      lightTheme.disabled = true;
    } else {
      darkTheme.disabled = true;
      lightTheme.disabled = false;
    }
  }, [settings.theme]);

  // Ensure active chat exists
  useEffect(() => {
    const activeChatExists = chatSessions.some(c => c.id === activeChatId);
    if (!activeChatId && chatSessions.length > 0) {
      setActiveChatId(chatSessions[0].id);
    } else if (activeChatId && !activeChatExists) {
      setActiveChatId(chatSessions.length > 0 ? chatSessions[0].id : null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatSessions, activeChatId]);


  const handleNewChat = () => {
    const newChat: ChatSession = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setChatSessions(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setCurrentPage('chat');
    // Also reset code state for a new conversation
    setCodeFiles([]);
    setActiveCodeFileId(null);
    setIsCodePanelVisible(false);
  };

  const handleSwitchChat = (chatId: string) => {
    setActiveChatId(chatId);
    setCurrentPage('chat');
    // For simplicity in this version, we'll clear the code panel. 
    // A more advanced version might persist code files per-chat.
    setCodeFiles([]);
    setActiveCodeFileId(null);
    setIsCodePanelVisible(false);
  };

  const handleSettingsChange = (settings: Settings) => {
    setSettings(settings);
  };

  const handleSendMessage = async (message: string) => {
    if (!ai || (apiKey && apiKeyStatus !== 'valid')) {
        let errorText = "The AI service is unavailable. Please ensure an API key is configured correctly.";
        if (apiKey && apiKeyStatus === 'invalid') {
            errorText = "Your API key is invalid or has exceeded its quota. Please check your key in Settings and try again.";
        } else if (!apiKey && !process.env.API_KEY) {
            errorText = "No API key found. Please add one in Settings or configure it on the server.";
        }
        
        const errorMessage: Message = {
            id: generateId(), role: 'model',
            textContent: errorText,
            codeFileIds: [], timestamp: new Date().toISOString(),
        };

        if (activeChatId) {
             setChatSessions(prev => prev.map(s => s.id === activeChatId ? { ...s, messages: [...s.messages, errorMessage] } : s));
        }
        return;
    }

    let sessionToUpdate: ChatSession;
    let targetChatId: string;
    let isFirstMessage = false;

    if (!activeChatId) {
        isFirstMessage = true;
        const newChat: ChatSession = {
            id: generateId(), title: "New Chat", messages: [], createdAt: new Date().toISOString(),
        };
        setChatSessions(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
        sessionToUpdate = newChat;
        targetChatId = newChat.id;
    } else {
        sessionToUpdate = chatSessions.find(s => s.id === activeChatId)!;
        targetChatId = activeChatId;
        isFirstMessage = sessionToUpdate.messages.length === 0;
    }

    setLoadingChatId(targetChatId);

    const userMessage: Message = {
        id: generateId(), role: 'user', textContent: message, codeFileIds: [], timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [...sessionToUpdate.messages, userMessage];
    setChatSessions(prev => prev.map(s => s.id === targetChatId ? { ...s, messages: updatedMessages } : s));

    try {
        const history: Content[] = sessionToUpdate.messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.textContent }],
        }));

        const fullSystemInstruction = [
          settings.persona,
          settings.context,
          'When you generate a code block, ALWAYS include a suggested filename with the correct extension after the language identifier. For example: ```python my_script.py',
        ].filter(Boolean).join('\n\n');

        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
            config: { systemInstruction: fullSystemInstruction },
        });

        const result = await chat.sendMessage({ message });
        const modelResponseText = result.text;
        
        // --- Code Parsing Logic ---
        let conversationalText = modelResponseText;
        const newCodeFileIds: string[] = [];
        const codeBlockRegex = /```([^\n]*)\n([\s\S]*?)```/g;
        let match;
        const newFiles: CodeFile[] = [];

        while ((match = codeBlockRegex.exec(modelResponseText)) !== null) {
            const [fullMatch, infoLine, code] = match;
            const infoParts = infoLine.trim().split(/\s+/);

            let language = 'plaintext';
            let filename;

            if (infoParts.length > 1) {
                language = infoParts[0];
                filename = infoParts[1];
            } else if (infoParts.length === 1 && infoParts[0]) {
                const part = infoParts[0];
                if (part.includes('.')) {
                    filename = part;
                    const extension = part.split('.').pop() || '';
                    const langMap: {[key:string]: string} = {
                        'js': 'javascript', 'ts': 'typescript', 'py': 'python',
                        'rb': 'ruby', 'html': 'xml', 'css': 'css', 'json': 'json',
                        'md': 'markdown', 'sh': 'bash', 'java': 'java', 'go': 'go',
                        'cpp': 'cpp', 'cs': 'csharp', 'php': 'php', 'rs': 'rust'
                    };
                    language = langMap[extension] || extension;
                } else {
                    language = part;
                }
            }

            if (!filename) {
                const extensionMap: { [key: string]: string } = {
                    'javascript': 'js', 'typescript': 'ts', 'python': 'py',
                    'html': 'html', 'xml': 'html', 'css': 'css', 'json': 'json',
                    'markdown': 'md', 'bash': 'sh', 'shell': 'sh', 'java': 'java',
                    'go': 'go', 'cpp': 'cpp', 'csharp': 'cs', 'php': 'php', 'rust': 'rs',
                    'ruby': 'rb'
                };
                const extension = extensionMap[language.toLowerCase()] || 'txt';
                filename = `script-${codeFiles.length + newFiles.length + 1}.${extension}`;
            }
            
            const newFile: CodeFile = {
                id: generateId(),
                filename,
                language,
                content: code.trim(),
                undoStack: [],
                redoStack: []
            };
            newFiles.push(newFile);
            newCodeFileIds.push(newFile.id);
            conversationalText = conversationalText.replace(fullMatch, '').trim();
        }

        if (newFiles.length > 0) {
            setCodeFiles(prev => [...prev, ...newFiles]);
            setActiveCodeFileId(newFiles[newFiles.length - 1].id);
            setIsCodePanelVisible(true);
        }
        
        const modelMessage: Message = {
            id: generateId(), role: 'model', textContent: conversationalText, codeFileIds: newCodeFileIds, timestamp: new Date().toISOString(),
        };

        setChatSessions(prev => prev.map(s => s.id === targetChatId ? { ...s, messages: [...updatedMessages, modelMessage] } : s));

        if (isFirstMessage) {
            const titlePrompt = `Generate a very short, concise title (4 words max) for a chat that starts with this message: "${message}". Respond with only the title.`;
            const titleResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: titlePrompt });
            const newTitle = titleResponse.text.trim().replace(/^"|"$/g, '');
            if (newTitle) {
                setChatSessions(prev => prev.map(s => s.id === targetChatId ? { ...s, title: newTitle } : s));
            }
        }
    } catch (error) {
        console.error("Error sending message:", error);
        let errorText = "Sorry, something went wrong. Please try again later.";
        if (error instanceof Error && error.message.includes('quota')) {
            errorText = "The current API key has exceeded its quota. Please try again later or provide a different key in Settings."
        }
        const errorMessage: Message = {
            id: generateId(), role: 'model',
            textContent: errorText,
            codeFileIds: [], timestamp: new Date().toISOString(),
        };
        setChatSessions(prev => prev.map(s => s.id === targetChatId ? { ...s, messages: [...s.messages, errorMessage] } : s));
    } finally {
        setLoadingChatId(null);
    }
  };
  
  // --- Code IDE Panel Handlers ---
  const handleCodeContentChange = (fileId: string, newContent: string) => {
    setCodeFiles(files => files.map(f => {
      if (f.id === fileId) {
        const newUndoStack = [...f.undoStack, f.content];
        return { ...f, content: newContent, undoStack: newUndoStack, redoStack: [] };
      }
      return f;
    }));
  };

  const handleUndo = (fileId: string) => {
    setCodeFiles(files => files.map(f => {
      if (f.id === fileId && f.undoStack.length > 0) {
        const newUndoStack = [...f.undoStack];
        const lastContent = newUndoStack.pop()!;
        const newRedoStack = [f.content, ...f.redoStack];
        return { ...f, content: lastContent, undoStack: newUndoStack, redoStack: newRedoStack };
      }
      return f;
    }));
  };

  const handleRedo = (fileId: string) => {
     setCodeFiles(files => files.map(f => {
      if (f.id === fileId && f.redoStack.length > 0) {
        const newRedoStack = [...f.redoStack];
        const nextContent = newRedoStack.shift()!;
        const newUndoStack = [...f.undoStack, f.content];
        return { ...f, content: nextContent, undoStack: newUndoStack, redoStack: newRedoStack };
      }
      return f;
    }));
  };

  const handleCloseTab = (fileId: string) => {
    let newActiveId: string | null = activeCodeFileId;
    const fileIndex = codeFiles.findIndex(f => f.id === fileId);

    if(fileId === activeCodeFileId) {
        if(codeFiles.length === 1) {
            newActiveId = null;
        } else if (fileIndex > 0) {
            newActiveId = codeFiles[fileIndex - 1].id;
        } else {
            newActiveId = codeFiles[fileIndex + 1].id;
        }
    }
    
    const newFiles = codeFiles.filter(f => f.id !== fileId);
    setCodeFiles(newFiles);
    setActiveCodeFileId(newActiveId);

    if (newFiles.length === 0) {
        setIsCodePanelVisible(false);
    }
  };

  const handleCodeCardClick = (fileId: string) => {
    setActiveCodeFileId(fileId);
    setIsCodePanelVisible(true);
  };

  const activeChat = chatSessions.find(c => c.id === activeChatId);
  const isAiReady = !!ai && (!apiKey || apiKeyStatus === 'valid');

  return (
    <div className={settings.theme}>
      <div className="flex h-screen font-sans bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Sidebar
          chatSessions={chatSessions} activeChatId={activeChatId} onNewChat={handleNewChat}
          onSwitchChat={handleSwitchChat} currentPage={currentPage} onSetPage={setCurrentPage}
          settings={settings} onSettingsChange={handleSettingsChange}
        />
        <main className="flex-1 flex flex-col min-w-0">
          {currentPage === 'chat' && (
            <div className="flex flex-1 min-h-0">
              {isAiReady ? (
                  <ChatPanel 
                    chatSession={activeChat}
                    onSendMessage={handleSendMessage}
                    isLoading={!!activeChatId && loadingChatId === activeChatId}
                    theme={settings.theme}
                    codeFiles={codeFiles}
                    onCodeCardClick={handleCodeCardClick}
                  />
                ) : (
                  <div className="w-full flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-900">
                    <h2 className="text-xl font-semibold text-red-500">AI Service Unavailable</h2>
                    {apiKey && apiKeyStatus === 'invalid' ? (
                        <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
                            The API key you provided is invalid or has reached its quota. Please go to{' '}
                            <button onClick={() => setCurrentPage('settings')} className="text-indigo-500 hover:underline font-semibold">Settings</button> to correct it.
                        </p>
                    ) : (
                         <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
                            Could not connect to the AI service. Please go to{' '}
                            <button onClick={() => setCurrentPage('settings')} className="text-indigo-500 hover:underline font-semibold">Settings</button> to provide an API key, or ensure one is configured on the server.
                        </p>
                    )}
                  </div>
              )}
              {isAiReady && isCodePanelVisible && (
                <CodeIDEPanel
                  files={codeFiles}
                  activeFileId={activeCodeFileId}
                  onActiveFileChange={setActiveCodeFileId}
                  onContentChange={handleCodeContentChange}
                  onCloseTab={handleCloseTab}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  theme={settings.theme}
                  onClosePanel={() => setIsCodePanelVisible(false)}
                />
              )}
            </div>
          )}
          {currentPage === 'settings' && (
            <SettingsPage 
              settings={settings} 
              onSettingsChange={handleSettingsChange} 
              apiKey={apiKey}
              onApiKeyChange={setApiKey}
              apiKeyStatus={apiKeyStatus}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;