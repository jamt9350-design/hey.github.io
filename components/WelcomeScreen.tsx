
import React from 'react';

interface WelcomeScreenProps {
  onPromptClick: (prompt: string) => void;
}

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9 1.9 5.8 1.9-5.8 5.8-1.9-5.8-1.9z" />
    </svg>
);

const SuggestionCard: React.FC<{ title: string; subtitle: string; onClick: () => void; }> = ({ title, subtitle, onClick }) => (
    <div onClick={onClick} className="group cursor-pointer p-4 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 text-left">
        <p className="font-semibold text-gray-800 dark:text-gray-200">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
);

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onPromptClick }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center w-full max-w-2xl">
        <div className="inline-block p-4 bg-indigo-100 dark:bg-indigo-900/50 rounded-full mb-4">
          <SparklesIcon className="w-10 h-10 text-indigo-600 dark:text-indigo-300" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-800 dark:text-gray-100">
          How can I help you today?
        </h1>
        
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SuggestionCard 
            title="Explain a concept" 
            subtitle="like quantum computing" 
            onClick={() => onPromptClick('Explain quantum computing in simple terms')} 
          />
          <SuggestionCard 
            title="Write some code" 
            subtitle="e.g., a Python script" 
            onClick={() => onPromptClick('Write a Python script that sorts a list of numbers')} 
          />
          <SuggestionCard 
            title="Plan a trip" 
            subtitle="for a weekend in Paris" 
            onClick={() => onPromptClick('Plan a 3-day itinerary for a trip to Paris')} 
          />
          <SuggestionCard 
            title="Draft a poem" 
            subtitle="about the rising sun" 
            onClick={() => onPromptClick('Write a short, four-stanza poem about the rising sun.')} 
          />
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
