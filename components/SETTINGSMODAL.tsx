import React, { useState, useEffect } from 'react';
import type { Settings, ChatSession, CarDetails } from '../types';
import CarBrandLogo from './CarBrandLogo'; // Import the new component

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
    sessions: ChatSession[];
    garage: CarDetails[];
    onSessionSelect: (sessionId: string) => void;
    onClearHistory: () => void;
    onDeleteSession: (sessionId: string) => void;
    onAddNewCar: () => void;
    onDeleteCar: (carDetails: CarDetails) => void;
    onStartDiagnosisFromGarage: (carDetails: CarDetails) => void;
    isInitialSetup: boolean;
}

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 1 0 .53 1.402c1.036-.342 2.11.086 2.835.944v10.198c0 .621.504 1.125 1.125 1.125H12a.75.75 0 0 0 0-1.5H8.25V6.101a.75.75 0 0 0-.12-1.025A1.75 1.75 0 0 1 7.5 3.75a1.25 1.25 0 0 1 1.25-1.25h3.5a1.25 1.25 0 0 1 1.25 1.25c0 .16-.02.316-.057.468a.75.75 0 1 0 1.45.394A2.75 2.75 0 0 0 12.5 2.5h-3.5A2.75 2.75 0 0 0 6 5.193v10.198c0 .621.504 1.125 1.125 1.125H12a2.25 2.25 0 0 0 2.25-2.25V5.101c.725-.858 1.799-1.286 2.835-.944a.75.75 0 1 0 .53-1.402c-.785-.248-1.57-.391-2.365-.468v-.443A2.75 2.75 0 0 0 12.5 1h-3.75Z" clipRule="evenodd" />
    </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
);

const GarageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M3.5 8.441a.75.75 0 0 0-1.5 0V14.5a.75.75 0 0 0 .75.75h14.5a.75.75 0 0 0 .75-.75V8.441a.75.75 0 0 0-1.5 0V14h-2V8.75a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0-.75.75V14h-2V8.441Z" />
        <path d="M18.5 4.75a.75.75 0 0 0-1.5 0v1.5h-13V4.75a.75.75 0 0 0-1.5 0v5.19L10 14.882l6.5-4.941V4.75Z" />
    </svg>
);

const HistoryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
  </svg>
);

const AppearanceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10 3a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 3ZM13.125 4.875a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 0 1-1.06 1.06l-1.06-1.06a.75.75 0 0 1 0-1.06ZM17 9.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75ZM13.125 15.125a.75.75 0 0 1 1.06 0l1.061-1.06a.75.75 0 0 1 1.06 1.06l-1.06 1.06a.75.75 0 0 1-1.06 0ZM10 17a.75.75 0 0 1-.75-.75v-1.5a.75.75 0 0 1 1.5 0v1.5A.75.75 0 0 1 10 17ZM6.875 15.125a.75.75 0 0 1-1.06 0l-1.06-1.06a.75.75 0 0 1 1.06-1.06l1.06 1.06a.75.75 0 0 1 0 1.06ZM3 9.25a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 3 9.25ZM6.875 4.875a.75.75 0 0 1-1.06 0L4.755 5.936a.75.75 0 0 1-1.06-1.061l1.06-1.06a.75.75 0 0 1 1.06 0Z" />
        <path d="M10 5.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM10 7a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z" />
    </svg>
);


type ActiveTab = 'garage' | 'history' | 'appearance';


const SettingOptionButton = ({ value, currentValue, onClick, children }: { value: string, currentValue: string, onClick: () => void, children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all border ${
            currentValue === value
            ? 'bg-amber-500 border-amber-500 text-slate-900 font-semibold'
            : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
        }`}
    >
        {children}
    </button>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange, sessions, garage, onSessionSelect, onClearHistory, onDeleteSession, onAddNewCar, onDeleteCar, onStartDiagnosisFromGarage, isInitialSetup }) => {
    const [activeTab, setActiveTab] = useState<ActiveTab>(isInitialSetup ? 'appearance' : 'garage');
    const [carToDelete, setCarToDelete] = useState<CarDetails | null>(null);
    const [sessionToDeleteId, setSessionToDeleteId] = useState<string | null>(null);
    const [isConfirmingClear, setIsConfirmingClear] = useState<boolean>(false);
    
    // Effect to reset confirmation states when the modal is closed
    useEffect(() => {
        if (!isOpen) {
            setCarToDelete(null);
            setSessionToDeleteId(null);
            setIsConfirmingClear(false);
        }
    }, [isOpen]);
    
    useEffect(() => {
        if (isInitialSetup) {
            setActiveTab('appearance');
        }
    }, [isInitialSetup]);

    const sortedSessions = sessions.slice().sort((a, b) => b.lastUpdated - a.lastUpdated);
    
    if (!isOpen) return null;
    
    // --- Car Deletion Handlers ---
    const handleDeleteCarClick = (e: React.MouseEvent, carDetails: CarDetails) => {
        e.stopPropagation();
        setCarToDelete(carDetails);
    };
    const handleConfirmDeleteCar = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (carToDelete) {
            onDeleteCar(carToDelete);
            setCarToDelete(null);
        }
    };
    const handleCancelDeleteCar = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCarToDelete(null);
    };

    // --- Session Deletion Handlers ---
    const handleDeleteSessionClick = (e: React.MouseEvent, sessionId: string) => {
        e.stopPropagation();
        setSessionToDeleteId(sessionId);
    };
    const handleConfirmDeleteSession = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (sessionToDeleteId) {
            onDeleteSession(sessionToDeleteId);
            setSessionToDeleteId(null);
        }
    };
    const handleCancelDeleteSession = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSessionToDeleteId(null);
    };

    // --- Clear All History Handlers ---
    const handleClearHistoryClick = () => setIsConfirmingClear(true);
    const handleConfirmClearHistory = () => {
        onClearHistory();
        setIsConfirmingClear(false);
    };
    const handleCancelClearHistory = () => setIsConfirmingClear(false);


    const TabButton = ({ tab, label, icon, disabled }: { tab: ActiveTab; label: string; icon: React.ReactNode; disabled?: boolean }) => (
        <button
            onClick={() => !disabled && setActiveTab(tab)}
            disabled={disabled}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab 
                ? 'bg-amber-100 dark:bg-slate-700 text-amber-700 dark:text-amber-300' 
                : 'text-slate-500 dark:text-slate-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}
            title={disabled ? "Available after starting a diagnosis" : ""}
        >
            {icon}
            {label}
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
                       <TabButton tab="garage" label="Garage" icon={<GarageIcon className="w-4 h-4" />} disabled={isInitialSetup} />
                       <TabButton tab="history" label="Chat History" icon={<HistoryIcon className="w-4 h-4" />} disabled={isInitialSetup} />
                       <TabButton tab="appearance" label="Appearance" icon={<AppearanceIcon className="w-4 h-4" />} />
                    </div>
                </div>
                
                <main className="flex-grow p-6 overflow-y-auto">
                    {activeTab === 'garage' && (
                        <div className="space-y-6">
                             <div>
                                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">My Vehicles</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Click a vehicle to start a new diagnosis. Deleting a vehicle removes it and all its chat history.</p>
                                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 mb-4">
                                     {garage.length > 0 ? garage.map((car) => {
                                        const isPendingDelete = carToDelete?.make === car.make && carToDelete?.model === car.model && carToDelete?.year === car.year;
                                        return (
                                        <div 
                                            key={`${car.make}-${car.model}-${car.year}`} 
                                            className={`w-full flex items-center justify-between gap-2 bg-slate-100 dark:bg-slate-900/50 rounded-lg border transition-all group ${isPendingDelete ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-700'}`}
                                        >
                                            <button 
                                                onClick={() => !isPendingDelete && onStartDiagnosisFromGarage(car)}
                                                className="flex-grow flex items-center gap-4 p-4 text-left disabled:cursor-default"
                                                disabled={isPendingDelete}
                                            >
                                                <CarBrandLogo make={car.make} className="w-10 h-10 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-100">{car.year} {car.make} {car.model}</p>
                                                    {isPendingDelete ? (
                                                        <p className="text-xs text-red-500 dark:text-red-400">Delete this car and all its chats?</p>
                                                    ) : (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Start new diagnosis</p>
                                                    )}
                                                </div>
                                            </button>
                                            { isPendingDelete ? (
                                                <div className="flex items-center gap-2 mr-3 flex-shrink-0">
                                                    <button onClick={handleConfirmDeleteCar} className="px-3 py-1 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">Yes, Delete</button>
                                                    <button onClick={handleCancelDeleteCar} className="px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">No</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => handleDeleteCarClick(e, car)}
                                                    className="p-2 mr-2 rounded-full text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                    aria-label={`Delete ${car.make} ${car.model}`}
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                     );
                                    }) : <p className="text-sm text-center text-slate-400 py-4">No vehicles in your garage yet.</p>}
                                </div>
                                <button 
                                    onClick={onAddNewCar}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 border border-amber-200 rounded-lg hover:bg-amber-200  dark:text-amber-300 dark:bg-amber-900/30 dark:border-amber-500/30 dark:hover:bg-amber-900/50 transition-colors"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Add New Vehicle to Garage
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'history' && (
                         <div className="space-y-6">
                            <div>
                                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Diagnosis History</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select a previous diagnosis session to continue, or delete it.</p>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                     {sortedSessions.length > 0 ? sortedSessions.map(session => {
                                        const isPendingDelete = sessionToDeleteId === session.id;
                                        return (
                                        <div 
                                            key={session.id} 
                                            className={`w-full flex items-center justify-between gap-2 text-left bg-slate-100 dark:bg-slate-900/50 rounded-lg border transition-all group ${isPendingDelete ? 'border-red-500/50 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-amber-500/50'}`}
                                        >
                                            <button 
                                                onClick={() => !isPendingDelete && onSessionSelect(session.id)}
                                                className="flex-grow flex items-center gap-4 p-4 disabled:cursor-default"
                                                disabled={isPendingDelete}
                                            >
                                                <CarBrandLogo make={session.carDetails.make} className="w-8 h-8 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-100">{session.carDetails.year} {session.carDetails.make} {session.carDetails.model}</p>
                                                    {isPendingDelete ? (
                                                         <p className="text-xs text-red-500 dark:text-red-400">Delete this session?</p>
                                                    ) : (
                                                         <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(session.lastUpdated).toLocaleString()}</p>
                                                    )}
                                                </div>
                                            </button>
                                             { isPendingDelete ? (
                                                <div className="flex items-center gap-2 mr-3 flex-shrink-0">
                                                    <button onClick={handleConfirmDeleteSession} className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">Yes</button>
                                                    <button onClick={handleCancelDeleteSession} className="px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">No</button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => handleDeleteSessionClick(e, session.id)}
                                                    className="p-2 mr-2 rounded-full text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                    aria-label="Delete session"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    )}) : <p className="text-sm text-center text-slate-400 py-4">No sessions yet.</p>}
                                </div>
                            </div>
                             <div>
                                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Manage History</h3>
                                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Permanently delete all saved diagnosis sessions and chat histories.</p>
                                {isConfirmingClear ? (
                                    <div className="p-3 bg-red-100/50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg">
                                        <p className="text-sm text-red-800 dark:text-red-200 mb-3">Are you sure? This action cannot be undone.</p>
                                        <div className="flex gap-2">
                                            <button onClick={handleConfirmClearHistory} className="px-4 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">Yes, Delete All</button>
                                            <button onClick={handleCancelClearHistory} className="px-4 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-200 dark:bg-slate-600 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleClearHistoryClick}
                                        disabled={sessions.length === 0}
                                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:border-slate-300 dark:disabled:border-slate-600 disabled:cursor-not-allowed dark:text-red-300 dark:bg-red-900/30 dark:border-red-500/30 dark:hover:bg-red-900/50 transition-colors"
                                    >
                                        Clear All History
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'appearance' && (
                         <div className="space-y-6">
                            <div>
                                <h3 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2">Theme</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Choose how the app looks.</p>
                                <div className="flex gap-2">
                                    <SettingOptionButton value="light" currentValue={settings.theme} onClick={() => onSettingsChange({ theme: 'light' })}>Light</SettingOptionButton>
                                    <SettingOptionButton value="dark" currentValue={settings.theme} onClick={() => onSettingsChange({ theme: 'dark' })}>Dark</SettingOptionButton>
                                    <SettingOptionButton value="system" currentValue={settings.theme} onClick={() => onSettingsChange({ theme: 'system' })}>System</SettingOptionButton>
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