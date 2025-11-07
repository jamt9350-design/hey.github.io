import React, { useState, useMemo } from 'react';
import { Settings, Page, ChatSession } from '../types';

interface SidebarProps {
  chatSessions: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSwitchChat: (chatId: string) => void;
  currentPage: Page;
  onSetPage: (page: Page) => void;
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

const NewChatIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5l0 14" /><path d="M5 12l14 0" />
  </svg>
);

const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const ChatIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" />
  </svg>
);

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const groupChatsByDate = (sessions: ChatSession[]) => {
    const groups: { [key: string]: ChatSession[] } = {
        Today: [], 'Previous 7 Days': [], 'Previous 30 Days': [], Older: []
    };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(today.getDate() - 7);
    const thirtyDaysAgo = new Date(today); thirtyDaysAgo.setDate(today.getDate() - 30);

    sessions.forEach(session => {
        const sessionDate = new Date(session.createdAt);
        if (sessionDate >= today) groups.Today.push(session);
        else if (sessionDate >= sevenDaysAgo) groups['Previous 7 Days'].push(session);
        else if (sessionDate >= thirtyDaysAgo) groups['Previous 30 Days'].push(session);
        else groups.Older.push(session);
    });
    return groups;
};


const Sidebar: React.FC<SidebarProps> = ({ chatSessions, activeChatId, onNewChat, onSwitchChat, currentPage, onSetPage, settings, onSettingsChange }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const toggleTheme = () => {
    onSettingsChange({ ...settings, theme: settings.theme === 'light' ? 'dark' : 'light' });
  };
  
  const filteredSessions = useMemo(() =>
    chatSessions.filter(session =>
      session.title.toLowerCase().includes(searchTerm.toLowerCase())
    ), [chatSessions, searchTerm]);

  const groupedChats = useMemo(() => groupChatsByDate(filteredSessions), [filteredSessions]);

  return (
    <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col p-4 shrink-0">
      <button
        onClick={onNewChat}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-left text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors duration-150"
      >
        New Chat
        <NewChatIcon className="w-5 h-5" />
      </button>
      
      <div className="mt-4 relative flex-1 overflow-y-auto">
        <input 
          type="text" 
          placeholder="Search history..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="mt-4 space-y-4">
          {Object.entries(groupedChats).map(([group, sessions]) => sessions.length > 0 && (
            <div key={group}>
              <h3 className="px-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{group}</h3>
              <div className="mt-2 space-y-1">
                {sessions.map(session => (
                  <div 
                    key={session.id} 
                    onClick={() => onSwitchChat(session.id)}
                    className={`flex items-center p-2 rounded-md cursor-pointer ${session.id === activeChatId ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-50' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                  >
                      <HistoryIcon className="w-4 h-4 mr-3 shrink-0"/>
                      <span className="text-sm font-medium truncate">{session.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-auto space-y-2">
        <button 
          onClick={toggleTheme} 
          className="w-full flex items-center justify-center p-2 text-gray-700 dark:text-gray-200 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          aria-label={`Switch to ${settings.theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {settings.theme === 'dark' ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
        </button>
        <button onClick={() => onSetPage('chat')} className={`flex items-center w-full p-2 text-sm font-medium rounded-md ${currentPage === 'chat' ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'} hover:bg-gray-200 dark:hover:bg-gray-800`}>
          <ChatIcon className="w-5 h-5 mr-3"/> Chat
        </button>
        <button onClick={() => onSetPage('settings')} className={`flex items-center w-full p-2 text-sm font-medium rounded-md ${currentPage === 'settings' ? 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'} hover:bg-gray-200 dark:hover:bg-gray-800`}>
          <SettingsIcon className="w-5 h-5 mr-3"/> Settings
        </button>
        <div className="flex items-center w-full p-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer text-gray-600 dark:text-gray-300">
          <UserIcon className="w-5 h-5 mr-3"/> Account
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;