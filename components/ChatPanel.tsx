import React, { useRef, useEffect } from 'react';
import { ChatSession, Message, CodeFile } from '../types';
import WelcomeScreen from './WelcomeScreen';
import MultimodalInput from './MultimodalInput';
import CodeCard from './CodeCard';

interface ChatPanelProps {
  chatSession: ChatSession | undefined;
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  theme: 'light' | 'dark';
  codeFiles: CodeFile[];
  onCodeCardClick: (fileId: string) => void;
}

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
);

const MessageContent: React.FC<{ message: Message, codeFiles: CodeFile[], onCodeCardClick: (fileId: string) => void }> = ({ message, codeFiles, onCodeCardClick }) => {
    const textWithBreaks = message.textContent.split('\n').map((line, i, arr) => (
        <React.Fragment key={i}>
            {line}
            {i < arr.length - 1 && <br />}
        </React.Fragment>
    ));

    return (
        <div className="text-gray-800 dark:text-gray-200 prose prose-sm dark:prose-invert max-w-none break-words space-y-4">
            {message.textContent && <div>{textWithBreaks}</div>}
            {message.codeFileIds.map(fileId => {
                const file = codeFiles.find(f => f.id === fileId);
                if (!file) return null;
                return <CodeCard key={fileId} file={file} onClick={() => onCodeCardClick(fileId)} timestamp={message.timestamp}/>
            })}
        </div>
    );
};


const ChatPanel: React.FC<ChatPanelProps> = ({ chatSession, onSendMessage, isLoading, theme, codeFiles, onCodeCardClick }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatSession?.messages, isLoading]);

  const handleSend = async (message: string) => {
    if (message.trim() && !isLoading) {
      await onSendMessage(message);
    }
  };

  const handlePromptClick = (prompt: string) => {
    if (!isLoading) {
      onSendMessage(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 w-full">
      <div className="flex-1 overflow-y-auto min-h-0"> {/* Main content wrapper */}
        {!chatSession ? (
          <div className="flex h-full"> {/* Container to help center WelcomeScreen */}
            <WelcomeScreen onPromptClick={handlePromptClick} />
          </div>
        ) : (
          <>
            <header className="sticky top-0 z-10 p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{chatSession.title}</h2>
            </header>
            
            <div className="p-6 space-y-6">
              {chatSession.messages.map((msg: Message) => (
                <div key={msg.id} className={`flex items-start gap-4`}>
                  {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0"><BotIcon className="w-5 h-5 text-gray-500 dark:text-gray-300"/></div>}
                  <div className={`p-4 rounded-lg max-w-2xl ${msg.role === 'user' ? 'bg-indigo-500 text-white ml-auto' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <MessageContent message={msg} codeFiles={codeFiles} onCodeCardClick={onCodeCardClick} />
                  </div>
                  {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0"><UserIcon className="w-5 h-5 text-gray-500 dark:text-gray-300"/></div>}
                </div>
              ))}
              {isLoading && (
                  <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0"><BotIcon className="w-5 h-5 text-gray-500 dark:text-gray-300"/></div>
                      <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                          </div>
                      </div>
                  </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
        <MultimodalInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatPanel;