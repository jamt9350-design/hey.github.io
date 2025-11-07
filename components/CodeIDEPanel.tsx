import React, { useRef, useEffect, useLayoutEffect, useState, useMemo } from 'react';
import { CodeFile } from '../types';

declare global {
    interface Window { hljs: any; }
}

const UndoIcon = ({...props}) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
);
const RedoIcon = ({...props}) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </svg>
);
const CopyIcon = ({...props}) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
);
const CloseIcon = ({...props}) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
);

const CheckIcon = ({...props}) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
);


interface EditorProps {
  file: CodeFile;
  theme: 'light' | 'dark';
  onContentChange: (fileId: string, newContent: string) => void;
}

const Editor: React.FC<EditorProps> = ({ file, theme, onContentChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const [lineCount, setLineCount] = useState(1);

    const syncScroll = () => {
        if (textareaRef.current && highlightRef.current?.parentElement && lineNumbersRef.current) {
            const top = textareaRef.current.scrollTop;
            highlightRef.current.parentElement.scrollTop = top;
            lineNumbersRef.current.scrollTop = top;
        }
    };

    useLayoutEffect(() => {
        const lines = file.content.split('\n').length;
        setLineCount(lines);
        if (highlightRef.current) {
            highlightRef.current.innerHTML = file.content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            window.hljs.highlightElement(highlightRef.current);
        }
        syncScroll();
    }, [file.content, file.language, theme]);


    return (
        <div className="flex-1 flex min-h-0 bg-gray-50 dark:bg-gray-900 font-mono text-sm relative">
            <div ref={lineNumbersRef} className="p-4 pr-2 text-right text-gray-500 select-none overflow-y-hidden bg-gray-100 dark:bg-gray-800/50">
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                ))}
            </div>
            <div className="relative flex-1 h-full">
                <textarea
                    ref={textareaRef}
                    value={file.content}
                    onChange={(e) => onContentChange(file.id, e.target.value)}
                    onScroll={syncScroll}
                    spellCheck="false"
                    className="absolute inset-0 w-full h-full p-4 resize-none bg-transparent border-none outline-none
                               text-transparent caret-gray-900 dark:caret-gray-100
                               font-inherit leading-normal"
                />
                <pre className="absolute inset-0 w-full h-full p-4 overflow-auto pointer-events-none" aria-hidden="true">
                    <code ref={highlightRef} className={`language-${file.language} font-inherit`}>
                        {file.content}
                    </code>
                </pre>
            </div>
        </div>
    );
};

interface CodeIDEPanelProps {
  files: CodeFile[];
  activeFileId: string | null;
  onActiveFileChange: (id: string) => void;
  onContentChange: (fileId: string, newContent: string) => void;
  onCloseTab: (fileId: string) => void;
  onUndo: (fileId: string) => void;
  onRedo: (fileId: string) => void;
  theme: 'light' | 'dark';
  onClosePanel: () => void;
}

const findMainHtmlFile = (allFiles: CodeFile[]): CodeFile | undefined => {
    const htmlFiles = allFiles.filter(f => f.filename.toLowerCase().endsWith('.html'));
    if (htmlFiles.length === 0) return undefined;
    const indexFile = htmlFiles.find(f => f.filename.toLowerCase() === 'index.html');
    if (indexFile) return indexFile;
    return htmlFiles[0];
};

const CodeIDEPanel: React.FC<CodeIDEPanelProps> = (props) => {
    const { files, activeFileId, onActiveFileChange, onContentChange, onCloseTab, onUndo, onRedo, theme, onClosePanel } = props;
    const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
    const activeFile = files.find(f => f.id === activeFileId);
    const [copied, setCopied] = useState(false);
    
    const isPreviewable = useMemo(() => files.some(f => f.filename.toLowerCase().endsWith('.html')), [files]);

    useEffect(() => {
        // When all HTML files are closed, if we are in preview mode, switch back to code mode.
        if (!isPreviewable && viewMode === 'preview') {
            setViewMode('code');
        }
    }, [isPreviewable, viewMode]);

    const handleCopy = () => {
        if (activeFile) {
            navigator.clipboard.writeText(activeFile.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    const mainHtmlFileForPreview = useMemo(() => findMainHtmlFile(files), [files]);

    const previewSrcDoc = useMemo(() => {
        if (!mainHtmlFileForPreview) return '';

        let htmlContent = mainHtmlFileForPreview.content;

        // Find linked stylesheets and replace with inline styles
        const linkRegex = /<link\s+.*?href=["'](?!https?:\/\/)(.*?)["'].*?>/g;
        htmlContent = htmlContent.replace(linkRegex, (match, href) => {
            const cssFile = files.find(f => f.filename === href.trim());
            if (cssFile) {
                return `<style>\n${cssFile.content}\n</style>`;
            }
            return match; // Keep the original tag if file not found
        });

        // Find linked scripts and replace with inline scripts
        const scriptRegex = /<script\s+.*?src=["'](?!https?:\/\/)(.*?)["'].*?>\s*<\/script>/g;
        htmlContent = htmlContent.replace(scriptRegex, (match, src) => {
            const jsFile = files.find(f => f.filename === src.trim());
            if (jsFile) {
                return `<script>\n${jsFile.content}\n</script>`;
            }
            return match; // Keep the original tag if file not found
        });

        return htmlContent;
    }, [files, mainHtmlFileForPreview]);
    
    return (
        <div className="w-1/2 max-w-1/2 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 flex flex-col h-full">
            {/* Tab Bar */}
            <div className="flex items-center border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                <div className="flex-1 flex items-center overflow-x-auto">
                    {files.map(file => (
                        <button
                            key={file.id}
                            onClick={() => onActiveFileChange(file.id)}
                            className={`flex items-center px-4 py-2 text-sm border-r border-gray-200 dark:border-gray-800 whitespace-nowrap ${
                                activeFileId === file.id
                                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                : 'text-gray-500 hover:bg-white/50 dark:hover:bg-gray-800/50'
                            }`}
                        >
                            {file.filename}
                            <CloseIcon onClick={(e) => { e.stopPropagation(); onCloseTab(file.id); }} className="w-4 h-4 ml-3 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"/>
                        </button>
                    ))}
                </div>
                <CloseIcon onClick={onClosePanel} className="w-6 h-6 p-1 m-1 cursor-pointer rounded-full hover:bg-gray-300 dark:hover:bg-gray-700"/>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 flex-shrink-0">
                <div className="flex items-center gap-4">
                     <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-800 rounded-lg text-sm font-medium">
                        <button
                            onClick={() => setViewMode('code')}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-md transition-colors ${viewMode === 'code' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-300/50 dark:hover:bg-gray-700/50'}`}
                        >
                            {viewMode === 'code' && <CheckIcon className="w-4 h-4"/>} Code
                        </button>
                        <button
                            onClick={() => setViewMode('preview')}
                            disabled={!isPreviewable}
                            className={`flex items-center justify-center gap-1.5 px-3 py-1 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${viewMode === 'preview' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-300/50 dark:hover:bg-gray-700/50'}`}
                        >
                           {viewMode === 'preview' && <CheckIcon className="w-4 h-4"/>} Preview
                        </button>
                    </div>

                    <div className="flex items-center">
                        <button 
                            onClick={() => activeFile && onUndo(activeFile.id)} 
                            disabled={!activeFile || activeFile.undoStack.length === 0}
                            className="p-1 rounded text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-800"
                            aria-label="Undo"
                        >
                            <UndoIcon className="w-5 h-5"/>
                        </button>
                        <button 
                            onClick={() => activeFile && onRedo(activeFile.id)} 
                            disabled={!activeFile || activeFile.redoStack.length === 0}
                            className="p-1 rounded text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-800"
                            aria-label="Redo"
                        >
                            <RedoIcon className="w-5 h-5"/>
                        </button>
                        <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-2"></div>
                        <button 
                            onClick={handleCopy} 
                            disabled={!activeFile}
                            className="p-1 rounded text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-800"
                            aria-label="Copy"
                        >
                            <CopyIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>
                 {copied && <span className="text-xs text-gray-500">Copied!</span>}
            </div>

            {/* Editor Body or Preview Pane */}
            {viewMode === 'preview' && isPreviewable ? (
                <div className="flex-1 bg-white">
                    <iframe
                        key={mainHtmlFileForPreview ? `${mainHtmlFileForPreview.id}-preview` : 'no-preview'}
                        srcDoc={previewSrcDoc}
                        title={mainHtmlFileForPreview ? `${mainHtmlFileForPreview.filename} Preview` : "Website Preview"}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts"
                    />
                </div>
            ) : activeFile ? (
                <Editor key={activeFile.id} file={activeFile} theme={theme} onContentChange={onContentChange} />
            ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-500">
                    <p>No file selected</p>
                </div>
            )}
        </div>
    );
};

export default CodeIDEPanel;