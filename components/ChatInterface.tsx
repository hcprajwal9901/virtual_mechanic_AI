
import React, { useState, useRef, useEffect } from 'react';
import type { CarDetails, ChatMessage, MediaData } from '../types';
import ChatMessageBubble from './ChatMessage';
import LoadingSpinner from './LoadingSpinner';

interface ChatInterfaceProps {
  carDetails: CarDetails;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string, media?: MediaData) => void;
}

const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.106a.75.75 0 0 1 0 1.06l-1.591 1.59a.75.75 0 1 1-1.06-1.06l1.59-1.59a.75.75 0 0 1 1.06 0ZM21.75 12a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75ZM12 18a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V18.75a.75.75 0 0 1 .75-.75ZM7.606 18.894a.75.75 0 0 1 1.06 0l1.59 1.591a.75.75 0 1 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06ZM3 12a.75.75 0 0 1-.75.75H.75a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 3 12ZM7.606 5.106a.75.75 0 0 1 1.06 0l1.59 1.591a.75.75 0 0 1-1.06 1.06l-1.59-1.59a.75.75 0 0 1 0-1.06ZM12 6.75a5.25 5.25 0 0 0-5.25 5.25c0 2.221 1.354 4.14 3.322 4.885a.75.75 0 0 1-.58 1.343 6.75 6.75 0 0 1-6.492-6.228 6.75 6.75 0 0 1 13.5 0 6.75 6.75 0 0 1-6.492 6.228.75.75 0 0 1-.58-1.343A5.25 5.25 0 0 0 12 6.75Z" />
  </svg>
);

const PaperclipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M18.97 3.659a2.25 2.25 0 0 0-3.182 0l-8.609 8.609a4.5 4.5 0 0 0 6.364 6.364l7.07-7.07a.75.75 0 0 1 1.06 1.06l-7.07 7.07a6 6 0 0 1-8.484-8.484l8.608-8.608a3.75 3.75 0 0 1 5.304 5.304l-7.932 7.932a2.25 2.25 0 0 1-3.182-3.182l8.3-8.3a.75.75 0 0 1 1.06 1.06l-8.3 8.3a.75.75 0 0 0 1.06 1.06l7.932-7.932a2.25 2.25 0 0 0 0-3.182Z" clipRule="evenodd" />
    </svg>
);

const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
        <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.75 6.75 0 1 1-13.5 0v-1.5A.75.75 0 0 1 6 10.5Z" />
    </svg>
);

const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z" clipRule="evenodd" />
  </svg>
);

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L10 8.586 7.707 6.293a1 1 0 0 0-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 1 0 1.414 1.414L10 11.414l2.293 2.293a1 1 0 0 0 1.414-1.414L11.414 10l2.293-2.293Z" clipRule="evenodd" />
    </svg>
);


const ChatInterface: React.FC<ChatInterfaceProps> = ({ carDetails, chatHistory, isLoading, error, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [media, setMedia] = useState<{file: File, preview: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        setAudioBlob(null); // Clear any audio recording
        const reader = new FileReader();
        reader.onloadend = () => {
            setMedia({ file, preview: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
     // Reset file input value to allow selecting the same file again
     if(event.target) event.target.value = '';
  };

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMedia(null); // Clear any image
        setAudioBlob(null);
        setIsRecording(true);
        audioChunksRef.current = [];
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };
        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            setAudioBlob(blob);
            // Stop all tracks to release microphone
            stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.start();
    } catch (err) {
        console.error("Error starting recording:", err);
        // You might want to set an error state here to show the user
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1];
            resolve(base64data);
        };
        reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || media || audioBlob) && !isLoading) {
      let mediaData: MediaData | undefined = undefined;

      if (media) {
          const base64String = media.preview.split(',')[1];
          mediaData = {
              type: 'image',
              data: base64String,
              mimeType: media.file.type,
          };
      } else if (audioBlob) {
          const base64String = await blobToBase64(audioBlob);
          mediaData = {
              type: 'audio',
              data: base64String,
              mimeType: audioBlob.type,
          };
      }
      
      onSendMessage(input, mediaData);
      setInput('');
      setMedia(null);
      setAudioBlob(null);
    }
  };

  const clearMedia = () => {
    setMedia(null);
    setAudioBlob(null);
  }
  
  const handleSuggestionClick = () => {
    const maintenancePrompt = `Based on my car's details (${carDetails.year} ${carDetails.make} ${carDetails.model} with ${carDetails.odometer} KM), what are some common or upcoming maintenance tasks I should be aware of? Please list a few key items with brief explanations and organize them clearly.`;
    onSendMessage(maintenancePrompt);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="bg-slate-800/80 backdrop-blur-sm p-4 border-b border-slate-700 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-xl font-bold text-slate-100">Virtual Mechanic</h1>
                <p className="text-sm text-amber-400">{`${carDetails.year} ${carDetails.make} ${carDetails.model} (${carDetails.fuelType}) - ${carDetails.odometer} KM`}</p>
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {chatHistory.map((msg, index) => (
            <ChatMessageBubble key={index} message={msg} />
          ))}
          {isLoading && chatHistory[chatHistory.length - 1]?.author === 'user' && (
             <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                    <LoadingSpinner />
                    <span className="text-slate-400">Mechanic is thinking...</span>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="bg-slate-800 p-4 border-t border-slate-700 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          {error && <p className="text-red-400 text-sm mb-2 text-center">{error}</p>}
          
          {chatHistory.length <= 2 && !isLoading && (
            <div className="mb-3 text-center">
              <button
                onClick={handleSuggestionClick}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-300 bg-slate-700/50 border border-slate-600 rounded-full hover:bg-slate-700 transition-colors"
              >
                <LightbulbIcon className="w-4 h-4" />
                Suggest Common Maintenance Tasks
              </button>
            </div>
          )}

          {(media || audioBlob) && (
            <div className="mb-3 p-3 bg-slate-700/50 border border-slate-600 rounded-lg relative">
              {media && <img src={media.preview} alt="Preview" className="max-h-24 rounded-md"/>}
              {audioBlob && <audio controls src={URL.createObjectURL(audioBlob)} className="w-full"></audio>}
              <button onClick={clearMedia} className="absolute -top-2 -right-2 bg-slate-600 rounded-full text-slate-200 hover:bg-slate-500">
                <XCircleIcon className="w-6 h-6"/>
              </button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex items-center space-x-2 md:space-x-4">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" hidden/>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading || isRecording} className="p-3 text-slate-400 hover:text-amber-400 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed">
                <PaperclipIcon className="w-6 h-6"/>
            </button>
            <button type="button" onClick={isRecording ? stopRecording : startRecording} disabled={isLoading} className={`p-3 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-amber-400'}`}>
                {isRecording ? <StopIcon className="w-6 h-6"/> : <MicIcon className="w-6 h-6"/>}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or add a description..."
              className="flex-1 w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-full text-slate-100 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
              disabled={isLoading || isRecording}
            />
            <button
              type="submit"
              disabled={isLoading || isRecording || (!input.trim() && !media && !audioBlob)}
              className="bg-amber-500 text-slate-900 p-3 rounded-full hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-amber-500 transition-all duration-300 disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default ChatInterface;
