import React, { useState } from 'react';
import type { Settings, ChatSession, Theme, FontSize } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
    sessions: ChatSession[];
    onSessionSelect: (sessionId: string) => void;
    onClearHistory: () => void;
    onDeleteSession: (sessionId: string) => void;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

const CarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M3.144 8.033a.75.75 0 0 1 .53.125l2.25 1.5a.75.75 0 0 1 0 1.282l-2.25 1.5a.75.75 0 0 1-1.06-1.06L3.939 10l-1.325-1.875a.75.75 0 0 1 .53-1.092ZM5.25 10a.75.75 0 0 1 .75-.75H14a.75.75 0 0 1 0 1.5H6a.75.75 0 0 1-.75-.75Zm9.956 1.817a.75.75 0 0 1-.53-.125l-2.25-1.5a.75.75 0 0 1 0-1.282l2.25-1.5a.75.75 0 1 1 1.06 1.06L16.061 10l1.325 1.875a.75.75 0 0 1-.53 1.092Z" clipRule="evenodd" />
        <path d="M14.5 3a1 1 0 0 0-1-1H6.5a1 1 0 0 0-1 1v1.372c.365-.123.753-.198 1.154-.221h.028c.447.024.895.12 1.328.296.438.178.86.42 1.26.728.4-.308.823-.55 1.26-.728.434-.176.88-.272 1.329-.296h.027c.4.023.79.098 1.153.221V3ZM6.5 6a2.5 2.5 0 0 0-2.5 2.5V15a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V8.5A2.5 2.5 0 0 0 13.5 6h-7Z" />
    </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.402c1.036-.342 2.11.086 2.835.944v10.198c0 .621.504 1.125 1.125 1.125H12a.75.75 0 0 0 0-1.5H8.25V6.101a.75.75 0 0 0-.12-1.025A1.75 1.75 0 0 1 7.5 3.75a1.25 1.25 0 0 1 1.25-1.25h3.5a1.25 1.25 0 0 1 1.25 1.25c0 .16-.02.316-.057.468a.75.75 0 1 0 1.45.394A2.75 2.75 0 0 0 12.5 2.5h-3.5A2.75 2.75 0 0 0 6 5.193v10.198c0 .621.504 1.125 1.125 1.125H12a2.25 2.25 0 0 0 2.25-2.25V5.101c.725-.858 1.799-1.286 2.835-.944a.75.75 0 1 0 .53-1.402c-.785-.248-1.57-.391-2.365-.468v-.443A2.75 2.75 0 0 0 12.5 1h-3.75Z" clipRule="evenodd" />
    </svg>
);


const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange, sessions, onSessionSelect, onClearHistory, onDeleteSession }) => {
    const [activeTab, setActiveTab] = useState<'account' | 'personalization'>('account');
    
    if (!isOpen) return null;
    
    const handleClear = () => {
        if (window.confirm("Are you sure you want to delete all your chat history? This action cannot be undone.")) {
            onClearHistory();
        }
    };
    
    const handleDeleteSessionClick = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation(); // Prevent the session from being selected when clicking delete
        if (window.confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
            onDeleteSession(sessionId);
        }
    };

    const sortedSessions = sessions.sort((a, b) => b.lastUpdated - a.lastUpdated);

    const TabButton = ({ tab, label }: { tab: 'account' | 'personalization', label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab 
                ? 'bg-amber-100 dark:bg-slate-700 text-amber-700 dark:text-amber-300' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
        >
            {label}
        </button>
    );

    const SettingOptionButton = ({ value, currentValue, onClick, children }: { value: string, currentValue: string, onClick: (value: any) => void, children: React.ReactNode }) => (
        <button
            onClick={() => onClick(value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
                currentValue === value
                ? 'bg-amber-500 border-amber-500 text-slate-900 font-semibold'
                : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Settings</h2>
                    <button onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-1 rounded-full">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-4 flex-shrink-0 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex space-x-2 bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg">
                       <TabButton tab="account" label="Account" />
                       <TabButton tab="personalization" label="Personalization" />
                    </div>
                </div>
                
                <main className="flex-grow p-6 overflow-y-auto">
                    {activeTab === 'account' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Garage</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select a previous diagnosis session to continue, or delete it.</p>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                     {sortedSessions.length > 0 ? sortedSessions.map(session => (
                                        <div 
                                            key={session.id} 
                                            className="w-full flex items-center justify-between gap-2 text-left bg-slate-100 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 transition-all group"
                                        >
                                            <button 
                                                onClick={() => onSessionSelect(session.id)}
                                                className="flex-grow flex items-center gap-4 p-4"
                                            >
                                                <CarIcon className="w-8 h-8 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-100">{session.carDetails.year} {session.carDetails.make} {session.carDetails.model}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(session.lastUpdated).toLocaleString()}</p>
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteSessionClick(e, session.id)}
                                                className="p-2 mr-2 rounded-full text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                aria-label="Delete session"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )) : <p className="text-sm text-center text-slate-400 py-4">No sessions yet.</p>}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Chat History</h3>
                                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Permanently delete all saved diagnosis sessions and chat histories.</p>
                                <button 
                                    onClick={handleClear}
                                    disabled={sessions.length === 0}
                                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:border-slate-300 dark:disabled:border-slate-600 disabled:cursor-not-allowed dark:text-red-300 dark:bg-red-900/30 dark:border-red-500/30 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    Clear All History
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'personalization' && (
                         <div className="space-y-6">
                            <div>
                                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Theme</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose how the app looks.</p>
                                <div className="flex gap-2">
                                    <SettingOptionButton value="light" currentValue={settings.theme} onClick={(theme: Theme) => onSettingsChange({ ...settings, theme })}>Light</SettingOptionButton>
                                    <SettingOptionButton value="dark" currentValue={settings.theme} onClick={(theme: Theme) => onSettingsChange({ ...settings, theme })}>Dark</SettingOptionButton>
                                    <SettingOptionButton value="system" currentValue={settings.theme} onClick={(theme: Theme) => onSettingsChange({ ...settings, theme })}>System</SettingOptionButton>
                                </div>
                            </div>
                             <div>
                                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Font Size</h3>
                                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Adjust the text size for better readability.</p>
                                <div className="flex gap-2">
                                     <SettingOptionButton value="text-sm" currentValue={settings.fontSize} onClick={(fontSize: FontSize) => onSettingsChange({ ...settings, fontSize })}>Small</SettingOptionButton>
                                    <SettingOptionButton value="text-base" currentValue={settings.fontSize} onClick={(fontSize: FontSize) => onSettingsChange({ ...settings, fontSize })}>Medium</SettingOptionButton>
                                    <SettingOptionButton value="text-lg" currentValue={settings.fontSize} onClick={(fontSize: FontSize) => onSettingsChange({ ...settings, fontSize })}>Large</SettingOptionButton>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SettingsModal;
