import React from 'react';
import { Settings } from '../types';

// Icons for the status indicator
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>
    </svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
);


interface ApiKeyStatusIndicatorProps {
  status: 'unknown' | 'valid' | 'invalid' | 'checking';
  apiKey: string;
}

const ApiKeyStatusIndicator: React.FC<ApiKeyStatusIndicatorProps> = ({ status, apiKey }) => {
  if (status === 'checking') {
    return (
      <div className="flex items-center text-sm text-yellow-600 dark:text-yellow-400 mt-2">
        <SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
        <span>Checking...</span>
      </div>
    );
  }
  if (status === 'valid') {
    return (
      <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-2">
        <CheckCircleIcon className="w-4 h-4 mr-2" />
        <span>API Key is valid.</span>
      </div>
    );
  }
  if (status === 'invalid') {
    return (
      <div className="flex items-center text-sm text-red-600 dark:text-red-400 mt-2">
        <XCircleIcon className="w-4 h-4 mr-2" />
        <span>Invalid or rate-limited API Key.</span>
      </div>
    );
  }
   if (status === 'unknown' && !apiKey) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Using default key. Enter your own Gemini API key for a personal quota.
      </p>
    );
  }
  return null;
};


interface SettingsPageProps {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  apiKeyStatus: 'unknown' | 'valid' | 'invalid' | 'checking';
}

const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSettingsChange, apiKey, onApiKeyChange, apiKeyStatus }) => {
  
  const handlePersonaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onSettingsChange({ ...settings, persona: e.target.value });
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onSettingsChange({ ...settings, context: e.target.value });
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">Settings</h1>
      
      <div className="space-y-8 max-w-2xl">
        
        <div>
          <label htmlFor="apiKey" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gemini API Key
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Provide your own Gemini API key to use your personal quota. You can get one from Google AI Studio.
          </p>
          <input
            id="apiKey"
            type="password"
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Enter your API key"
          />
          <ApiKeyStatusIndicator status={apiKeyStatus} apiKey={apiKey} />
        </div>

        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>

        <div>
          <label htmlFor="persona" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            AI Persona
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Define the personality and role of the AI. This sets the tone for its responses.
          </p>
          <textarea
            id="persona"
            rows={4}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
            value={settings.persona}
            onChange={handlePersonaChange}
            placeholder="e.g., You are a helpful assistant that speaks like a pirate."
          />
        </div>

        <div>
          <label htmlFor="context" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
            System Instructions
          </label>
           <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Provide specific rules and context for the AI to follow in every conversation.
          </p>
          <textarea
            id="context"
            rows={6}
            className="w-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-gray-100"
            value={settings.context}
            onChange={handleContextChange}
            placeholder="e.g., Always provide code examples in Python. Keep explanations brief."
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;