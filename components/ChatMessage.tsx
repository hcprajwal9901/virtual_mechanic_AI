import React, { useState } from 'react';
import type { ChatMessage, MediaData } from '../types';
import { MessageAuthor } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
  onSendMessage?: (message: string, media?: MediaData) => void;
}

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-900 flex-shrink-0">
        U
    </div>
);

const ModelIcon = () => (
    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-500 dark:text-amber-300">
            <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-7.19c-2.818 .554-5.22 2.14-6.685 4.195A.75.75 0 0 1 1.5 18c0-5.056 2.383-9.555 6.084-12.436A6.75 6.75 0 0 1 9.315 7.584Z" clipRule="evenodd" />
        </svg>
    </div>
);

const SourceLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1 inline-block">
        <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
        <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 0 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
);

const PartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 inline-block">
        <path fillRule="evenodd" d="M11.49 3.17a.75.75 0 0 1 1.02.07l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 0 1-1.13-1.002l3.24-3.645H3.75a.75.75 0 0 1 0-1.5h10.98L11.47 4.24a.75.75 0 0 1 .02-.998ZM3.75 8.25a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
);

const ToolIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 inline-block">
        <path d="M10 3.75a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM10 8.75a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM10 13.75a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
     </svg>
);


// Renders markdown-like text from the model into styled HTML.
const SimpleMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const renderHtml = (inputText: string) => {
        const lines = inputText.split('\n');
        let html = '';
        let i = 0;

        const escapeHtml = (unsafe: string) => {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        };

        const processInlines = (line: string) => {
            return line
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/`([^`]+)`/g, '<code class="bg-slate-200 dark:bg-slate-600/50 px-1.5 py-0.5 rounded-md font-mono text-sm">$1</code>')
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline">$1</a>');
        };

        while (i < lines.length) {
            const line = lines[i];

            // Code Blocks
            if (line.startsWith('```')) {
                let codeBlockContent = '';
                i++; // Move past the opening ```
                while (i < lines.length && !lines[i].startsWith('```')) {
                    codeBlockContent += lines[i] + '\n';
                    i++;
                }
                html += `<pre><code class="block whitespace-pre-wrap bg-slate-200 dark:bg-slate-900/50 p-4 rounded-md text-sm font-mono">${escapeHtml(codeBlockContent.trimEnd())}</code></pre>`;
                i++; // Skip the closing ```
                continue;
            }

            // Headings
            if (line.startsWith('### ')) {
                html += `<h3>${processInlines(line.substring(4))}</h3>`;
                i++;
                continue;
            }
            if (line.startsWith('## ')) {
                html += `<h2>${processInlines(line.substring(3))}</h2>`;
                i++;
                continue;
            }
            if (line.startsWith('# ')) {
                html += `<h1>${processInlines(line.substring(2))}</h1>`;
                i++;
                continue;
            }

            // Unordered Lists
            if (line.startsWith('* ') || line.startsWith('- ')) {
                html += '<ul>';
                while (i < lines.length && (lines[i].startsWith('* ') || lines[i].startsWith('- '))) {
                    html += `<li>${processInlines(lines[i].substring(2))}</li>`;
                    i++;
                }
                html += '</ul>';
                continue;
            }

            // Ordered Lists
            if (line.match(/^\d+\.\s/)) {
                html += '<ol>';
                while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
                    html += `<li>${processInlines(lines[i].replace(/^\d+\.\s/, ''))}</li>`;
                    i++;
                }
                html += '</ol>';
                continue;
            }
            
            // Paragraphs (group consecutive non-empty lines)
            if (line.trim() !== '') {
                let paraContent = '';
                while (i < lines.length && lines[i].trim() !== '') {
                    const currentLine = lines[i];
                    // Check if this line starts a new block element type. If so, break the paragraph.
                    if (
                        currentLine.startsWith('```') ||
                        currentLine.startsWith('# ') || currentLine.startsWith('## ') || currentLine.startsWith('### ') ||
                        currentLine.startsWith('* ') || currentLine.startsWith('- ') ||
                        currentLine.match(/^\d+\.\s/)
                    ) {
                        break;
                    }
                    paraContent += currentLine + '\n';
                    i++;
                }
                if (paraContent.trim() !== '') {
                    // Use <br> for intentional line breaks within a paragraph block
                    html += `<p>${processInlines(paraContent.trim().replace(/\n/g, '<br />'))}</p>`;
                }
                continue;
            }

            // If it is a blank line, just advance the index.
            i++;
        }

        return html;
    };
    
    // Use dangerouslySetInnerHTML as we trust the source (Gemini API) and need to render HTML.
    return <div dangerouslySetInnerHTML={{ __html: renderHtml(text) }} />;
};


const CollapsibleButton: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode; }> = ({ title, children, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="mt-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-300 bg-slate-200 dark:bg-slate-600/50 border border-slate-300 dark:border-slate-600 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors w-full sm:w-auto text-left"
            >
                {icon}
                {title}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-4 h-4 transition-transform ml-auto ${isOpen ? 'transform rotate-180' : ''}`}>
                    <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className="mt-3 text-xs border-l-2 border-slate-300 dark:border-slate-600 pl-4">
                    {children}
                </div>
            )}
        </div>
    );
};


const ChatMessageBubble: React.FC<ChatMessageProps> = ({ message, onSendMessage }) => {
  const isUser = message.author === MessageAuthor.USER;
  const [actionTaken, setActionTaken] = useState(false);
  
  const handleAction = (prompt: string) => {
      if (onSendMessage && !actionTaken) {
          onSendMessage(prompt);
          setActionTaken(true);
      }
  };


  if (isUser) {
    return (
      <div className="flex justify-end items-start gap-3">
        <div className="bg-amber-500 text-slate-900 rounded-2xl rounded-tr-none p-4 max-w-xl">
          {message.media?.type === 'image' && (
            <img src={`data:${message.media.mimeType};base64,${message.media.data}`} className="rounded-lg mb-2 max-w-full h-auto" alt="User upload" />
          )}
          {message.media?.type === 'audio' && (
            <audio controls src={`data:${message.media.mimeType};base64,${message.media.data}`} className="w-full mb-2">
              Your browser does not support the audio element.
            </audio>
          )}
          {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
        </div>
        <UserIcon />
      </div>
    );
  }
  
  // --- Parsing logic for Model messages ---
  let processedText = message.text;

  // 1. Extract Prompt Buttons
  const promptMatch = processedText.match(/\[PROMPT_BUTTONS\](.*?)\|(.*?)\|(.*)/);
  let actionParts: string[] = [];
  if (promptMatch) {
      actionParts = [promptMatch[1], promptMatch[2], promptMatch[3]];
      processedText = processedText.replace(/\[PROMPT_BUTTONS\].*/, '');
  }

  // 2. Extract Parts Button Content
  const partsMatch = processedText.match(/\[PARTS_BUTTON\](.*?)\[\/PARTS_BUTTON\]/s);
  const partsContent = partsMatch ? partsMatch[1].trim() : null;
  if(partsMatch) processedText = processedText.replace(partsMatch[0], '');
  
  // 3. Extract Tools Button Content
  const toolsMatch = processedText.match(/\[TOOLS_BUTTON\](.*?)\[\/TOOLS_BUTTON\]/s);
  const toolsContent = toolsMatch ? toolsMatch[1].trim() : null;
  if(toolsMatch) processedText = processedText.replace(toolsMatch[0], '');


  return (
    <div className="flex justify-start items-start gap-3">
      <ModelIcon />
      <div className="bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none p-4 max-w-xl w-full">
        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-200 prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-a:text-amber-600 dark:prose-a:text-amber-400 hover:prose-a:underline">
           <SimpleMarkdownRenderer text={processedText.trim()} />
        </div>
        
        {(partsContent || toolsContent) && (
             <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600 flex flex-col sm:flex-row gap-3">
                {partsContent && (
                    <CollapsibleButton title="Required Parts" icon={<PartIcon />}>
                        <div className="prose prose-xs dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-200 prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-a:text-amber-600 dark:prose-a:text-amber-400 hover:prose-a:underline">
                             <SimpleMarkdownRenderer text={partsContent} />
                        </div>
                    </CollapsibleButton>
                )}
                {toolsContent && (
                    <CollapsibleButton title="Required Tools" icon={<ToolIcon />}>
                         <div className="prose prose-xs dark:prose-invert max-w-none prose-p:text-slate-700 dark:prose-p:text-slate-200 prose-li:text-slate-600 dark:prose-li:text-slate-300 prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-a:text-amber-600 dark:prose-a:text-amber-400 hover:prose-a:underline">
                             <SimpleMarkdownRenderer text={toolsContent} />
                        </div>
                    </CollapsibleButton>
                )}
             </div>
        )}

        {actionParts.length === 3 && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                <p className="mb-3 text-sm">{actionParts[0]}</p>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => handleAction(actionParts[1])}
                        disabled={actionTaken}
                        className="px-4 py-2 text-sm font-semibold text-slate-900 bg-amber-500 rounded-lg hover:bg-amber-400 transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:text-slate-500 dark:disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        {actionParts[1]}
                    </button>
                    <button 
                        onClick={() => handleAction(actionParts[2])}
                        disabled={actionTaken}
                        className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600/80 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        {actionParts[2]}
                    </button>
                </div>
            </div>
        )}
        
        {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                <CollapsibleButton title="Sources" icon={<SourceLinkIcon />}>
                    <ul className="space-y-2 mt-3">
                        {message.sources.map((source, index) => source.web && (
                            <li key={index} className="flex items-start">
                               <span className="text-slate-500 dark:text-slate-400 mr-2 font-mono">{index + 1}.</span>
                                <a 
                                    href={source.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-amber-600 dark:text-amber-400 hover:underline break-all flex-1"
                                >
                                   {source.web.title || source.web.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                </CollapsibleButton>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;