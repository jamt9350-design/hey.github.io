import React from 'react';
import { CodeFile } from '../types';

interface CodeCardProps {
    file: CodeFile;
    onClick: () => void;
    timestamp: string;
}

const CodeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
    </svg>
);

const CodeCard: React.FC<CodeCardProps> = ({ file, onClick, timestamp }) => {
    
    const formattedTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
        <div 
            onClick={onClick}
            className="mt-2 p-3 bg-gray-200 dark:bg-gray-700/50 rounded-lg cursor-pointer
                       border border-gray-300 dark:border-gray-600
                       hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <CodeIcon className="w-5 h-5 text-gray-600 dark:text-gray-300 mr-3 shrink-0"/>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 font-mono">{file.filename}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formattedTime}</span>
            </div>
        </div>
    );
};

export default CodeCard;
