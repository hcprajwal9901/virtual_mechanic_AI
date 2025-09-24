

import React from 'react';
import type { ChatMessage } from '../types';
import { MessageAuthor } from '../types';

interface ChatMessageProps {
  message: ChatMessage;
}

const UserIcon = () => (
    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-900 flex-shrink-0">
        U
    </div>
);

const ModelIcon = () => (
    <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-300">
            <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-7.19c-2.818.554-5.22 2.14-6.685 4.195A.75.75 0 0 1 1.5 18c0-5.056 2.383-9.555 6.084-12.436A6.75 6.75 0 0 1 9.315 7.584Z" clipRule="evenodd" />
        </svg>
    </div>
);

const SourceLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1.5 inline-block">
        <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
        <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 0 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
);


const ChatMessageBubble: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.author === MessageAuthor.USER;

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

  return (
    <div className="flex justify-start items-start gap-3">
      <ModelIcon />
      <div className="bg-slate-700 text-slate-200 rounded-2xl rounded-tl-none p-4 max-w-xl">
        <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-200 prose-li:text-slate-300 prose-strong:text-slate-100">
           <pre className="whitespace-pre-wrap font-sans text-base">{message.text}</pre>
        </div>
        {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-600">
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Sources:</h4>
                <ul className="space-y-1.5">
                    {message.sources.map((source, index) => source.web && (
                        <li key={index}>
                            <a 
                                href={source.web.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-amber-400 text-xs hover:underline break-all flex items-center"
                            >
                               <SourceLinkIcon /> {source.web.title || source.web.uri}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;
