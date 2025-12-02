import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CarDetails, ChatMessage, MediaData, ChatSession, Settings, Theme } from './types';
import { MessageAuthor } from './types';
import CarDetailsForm from './components/CarDetailsForm';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';

// localStorage keys
const SESSIONS_KEY = 'virtualMechanicSessions';
const SETTINGS_KEY = 'virtualMechanicSettings';
const GARAGE_KEY = 'virtualMechanicGarage';

const App: React.FC = () => {

  // Load stored sessions, garage, settings
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [garage, setGarage] = useState<CarDetails[]>(() => {
    try {
      const saved = localStorage.getItem(GARAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      const parsed = saved ? JSON.parse(saved) : { theme: 'system' };
      const { fontSize, ...rest } = parsed;
      return { theme: 'system', ...rest };
    } catch { return { theme: 'system' }; }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [addCarFlow, setAddCarFlow] = useState(false);

  // IMPORTANT — API KEY FIX 🔥
  // This ensures GitHub Pages production build works.
  const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY;

  const chatRef = useRef<any>(null);

  const currentSession = useMemo(
    () => sessions.find(s => s.id === currentSessionId),
    [sessions, currentSessionId]
  );

  const carDetails = currentSession?.carDetails;
  const chatHistory = currentSession?.chatHistory;

  // Save local data
  useEffect(() => localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem(GARAGE_KEY, JSON.stringify(garage)), [garage]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    if (settings.theme === "dark" || (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      root.classList.add("dark");
    } else root.classList.add("light");
  }, [settings]);

  // SYSTEM PROMPT
  const getSystemInstruction = (details: CarDetails) => `
You are Virtual Mechanic — an AI expert for diagnosing cars in India.

Car Details:
Make: ${details.make}
Model: ${details.model}
Year: ${details.year}
Fuel: ${details.fuelType}
Odometer: ${details.odometer}
`;

  // Initialize chat with API KEY FIX
  const initializeChat = useCallback(async (details: CarDetails, history: ChatMessage[]) => {
    setIsLoading(true);
    setError(null);
    chatRef.current = null;

    try {
      if (!API_KEY) throw new Error("API key missing.");

      const ai = new GoogleGenerativeAI(API_KEY);

      const sdkHistory = history
        .map(msg => {
          const role = msg.author === MessageAuthor.USER ? "user" : "model";
          const parts: any[] = [];
          if (msg.text) parts.push({ text: msg.text });
          if (msg.media) parts.push({
            inlineData: {
              data: msg.media.data,
              mimeType: msg.media.mimeType
            }
          });
          return { role, parts };
        })
        .filter(h => h.parts.length > 0);

      // startChat is not declared on the library's TS types; cast to any to call it
      const chat = (ai as any).startChat({
        model: "gemini-2.5-flash",
        history: sdkHistory,
        systemInstruction: getSystemInstruction(details),
        tools: [{ googleSearch: {} }]
      });

      chatRef.current = chat;

      if (history.length === 0) {
        const welcome: ChatMessage = {
          author: MessageAuthor.MODEL,
          text: `Hello! I'm your Virtual Mechanic. How can I help with your ${details.year} ${details.make} ${details.model}?`,
        };

        setSessions(prev =>
          prev.map(s =>
            s.id === currentSessionId
              ? { ...s, chatHistory: [welcome], lastUpdated: Date.now() }
              : s
          )
        );
      }

    } catch (e: any) {
      setError("Chat setup failed: " + e.message);
    } finally {
      setIsLoading(false);
    }

  }, [currentSessionId, API_KEY]);

  useEffect(() => {
    if (currentSession) {
      initializeChat(currentSession.carDetails, currentSession.chatHistory);
    }
  }, [currentSession, initializeChat]);

  // Send message
  const handleSendMessage = useCallback(async (text: string, media?: MediaData) => {
    if (!chatRef.current) return setError("Chat not initialized.");
    if (!currentSessionId) return;

    const userMessage: ChatMessage = { author: MessageAuthor.USER, text, media };

    const updateHistory = (fn: (prev: ChatMessage[]) => ChatMessage[]) => {
      setSessions(prev =>
        prev
          .map(s =>
            s.id === currentSessionId
              ? { ...s, chatHistory: fn(s.chatHistory), lastUpdated: Date.now() }
              : s
          )
          .sort((a, b) => b.lastUpdated - a.lastUpdated)
      );
    };

    updateHistory(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const parts: any[] = [{ text }];
      if (media) {
        parts.push({
          inlineData: {
            data: media.data,
            mimeType: media.mimeType
          }
        });
      }

      const stream = await chatRef.current.sendMessageStream(parts);

      const modelMessage: ChatMessage = {
        author: MessageAuthor.MODEL,
        text: "",
        sources: [],
      };

      updateHistory(prev => [...prev, modelMessage]);

      for await (const chunk of stream) {
        const chunkText = chunk.text ?? "";
        updateHistory(prev => {
          const newHist = [...prev];
          newHist[newHist.length - 1].text += chunkText;
          return newHist;
        });
      }

    } catch (e: any) {
      updateHistory(prev => [
        ...prev,
        { author: MessageAuthor.MODEL, text: "Error: " + e.message },
      ]);

    } finally { setIsLoading(false); }

  }, [currentSessionId]);

  // Session controls
  const handleCarDetailsSubmit = (details: CarDetails) => {
    if (addCarFlow) {
      const exists = garage.some(
        c => c.make === details.make && c.model === details.model && c.year === details.year
      );
      if (!exists) setGarage(prev => [...prev, details]);
      setAddCarFlow(false);
    }

    const newSession: ChatSession = {
      id: Date.now().toString(),
      carDetails: details,
      chatHistory: [],
      lastUpdated: Date.now(),
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">

      {!currentSession || !carDetails ? (
        <CarDetailsForm
          onSubmit={handleCarDetailsSubmit}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
      ) : (
        <ChatInterface
          carDetails={carDetails}
          chatHistory={chatHistory!}
          isLoading={isLoading}
          error={error}
          onSendMessage={handleSendMessage}
          onNewDiagnosis={() => setCurrentSessionId(null)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
      )}

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        sessions={sessions}
        garage={garage}
        onSessionSelect={setCurrentSessionId}
        onClearHistory={() => setSessions([])}
        onDeleteSession={id =>
          setSessions(prev => prev.filter(s => s.id !== id))
        }
        onAddNewCar={() => setAddCarFlow(true)}
        onDeleteCar={car =>
          setGarage(prev => prev.filter(c =>
            !(c.make === car.make && c.model === car.model && c.year === car.year)
          ))
        }
        onStartDiagnosisFromGarage={handleCarDetailsSubmit}
        isInitialSetup={!currentSession}
      />
    </div>
  );
};

export default App;
