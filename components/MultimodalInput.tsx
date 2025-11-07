import React, { useState } from 'react';

interface MultimodalInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
}

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
    </svg>
);

const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
);


const MultimodalInput: React.FC<MultimodalInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    // Handle file drop logic here
    console.log(e.dataTransfer.files);
  };
  
  // Basic paste handling
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Handle image paste logic here
    console.log(e.clipboardData.files);
  };

  return (
    <div 
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} // Necessary for drop to work
        onDrop={handleDrop}
        className={`relative transition-colors rounded-lg ${isDragging ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
    >
      <form onSubmit={handleSend} className="relative">
        <div className="flex items-end p-2 bg-gray-100 dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-700 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
            <div className="flex items-center space-x-1">
                <button type="button" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Attach file">
                    <FileIcon className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Attach image">
                    <ImageIcon className="w-5 h-5" />
                </button>
            </div>
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                }
                }}
                onPaste={handlePaste}
                placeholder="Type your message, or drag and drop files..."
                rows={1}
                className="flex-1 p-2 max-h-40 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 resize-none"
                style={{'--tw-ring-color': 'transparent'} as React.CSSProperties} // remove inner ring
            />
            <button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
            >
                <SendIcon className="w-5 h-5" />
            </button>
        </div>
      </form>
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 rounded-lg border-2 border-dashed border-indigo-500">
            <p className="text-indigo-600 font-semibold">Drop files here</p>
        </div>
      )}
    </div>
  );
};

export default MultimodalInput;