import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CarDetails, ChatMessage, MediaData, ChatSession, Settings } from './types';
import { MessageAuthor } from './types';

import CarDetailsForm from './components/CarDetailsForm';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';

// localStorage keys
const SESSIONS_KEY = 'virtualMechanicSessions';
const SETTINGS_KEY = 'virtualMechanicSettings';
const GARAGE_KEY = 'virtualMechanicGarage';

const App: React.FC = () => {

  // ----------------------------------------------
  //  ✔ FIXED — API KEY LOADING
  // ----------------------------------------------
  const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY;

  // ----------------------------------------------
  // STATE
  // ----------------------------------------------
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [garage, setGarage] = useState<CarDetails[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(GARAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return { theme: saved.theme || "system" };
    } catch {
      return { theme: "system" };
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [addCarFlow, setAddCarFlow] = useState(false);

  const chatRef = useRef<any>(null);

  const currentSession = useMemo(
    () => sessions.find(s => s.id === currentSessionId),
    [sessions, currentSessionId]
  );

  const carDetails = currentSession?.carDetails;
  const chatHistory = currentSession?.chatHistory;

  // ----------------------------------------------
  // Sync localStorage
  // ----------------------------------------------
  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(GARAGE_KEY, JSON.stringify(garage));
  }, [garage]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    const root = document.documentElement;
    root.classList.remove("light", "dark");

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDark = settings.theme === "dark" || (settings.theme === "system" && prefersDark);

    root.classList.add(useDark ? "dark" : "light");
  }, [settings]);

  // ----------------------------------------------
  // System Prompt
  // ----------------------------------------------
  const getSystemInstruction = (details: CarDetails) => `
You are Virtual Mechanic — an AI expert for diagnosing Indian vehicles.

Car Details:
Make: ${details.make}
Model: ${details.model}
Year: ${details.year}
Fuel Type: ${details.fuelType}
Odometer: ${details.odometer}
`;

  // ----------------------------------------------
  // Initialize Chat
  // ----------------------------------------------
  const initializeChat = useCallback(
    async (details: CarDetails, history: ChatMessage[]) => {
      setIsLoading(true);
      setError(null);
      chatRef.current = null;

      try {
        if (!API_KEY) {
          throw new Error("API key missing. Add VITE_GEMINI_API_KEY to your .env file.");
        }

        const ai = new GoogleGenerativeAI(API_KEY);

        const sdkHistory = history
          .map(msg => {
            const role = msg.author === MessageAuthor.USER ? "user" : "model";
            const parts: any[] = [];
            if (msg.text) parts.push({ text: msg.text });

            if (msg.media) {
              parts.push({
                inlineData: {
                  data: msg.media.data,
                  mimeType: msg.media.mimeType,
                },
              });
            }

            return { role, parts };
          })
          .filter(h => h.parts.length > 0);

        const chat = (ai as any).startChat({
          model: "gemini-2.5-flash",
          history: sdkHistory,
          systemInstruction: getSystemInstruction(details),
          tools: [{ googleSearch: {} }],
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
      } catch (err: any) {
        setError("Chat setup failed: " + err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [API_KEY, currentSessionId]
  );

  useEffect(() => {
    if (currentSession) {
      initializeChat(currentSession.carDetails, currentSession.chatHistory);
    }
  }, [currentSession, initializeChat]);

  // ----------------------------------------------
  // Handle Message Send
  // ----------------------------------------------
  const handleSendMessage = useCallback(
    async (text: string, media?: MediaData) => {
      if (!chatRef.current) {
        return setError("Chat not ready.");
      }

      if (!currentSessionId) return;

      const userMessage: ChatMessage = {
        author: MessageAuthor.USER,
        text,
        media,
      };

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
              mimeType: media.mimeType,
            },
          });
        }

        const stream = await chatRef.current.sendMessageStream(parts);

        const modelMessage: ChatMessage = {
          author: MessageAuthor.MODEL,
          text: "",
        };

        updateHistory(prev => [...prev, modelMessage]);

        for await (const chunk of stream) {
          const chunkText = chunk.text || "";
          updateHistory(prev => {
            const newHist = [...prev];
            newHist[newHist.length - 1].text += chunkText;
            return newHist;
          });
        }
      } catch (error: any) {
        updateHistory(prev => [
          ...prev,
          { author: MessageAuthor.MODEL, text: "Error: " + error.message },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentSessionId]
  );

  // ----------------------------------------------
  // Create New Chat Session
  // ----------------------------------------------
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

  // ----------------------------------------------
  // UI
  // ----------------------------------------------
  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {!API_KEY && (
        <div className="text-red-500 text-center p-2 bg-red-100">
          API key missing — add VITE_GEMINI_API_KEY to your .env
        </div>
      )}

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
          setGarage(prev =>
            prev.filter(
              c =>
                !(c.make === car.make && c.model === car.model && c.year === car.year)
            )
          )
        }
        onStartDiagnosisFromGarage={handleCarDetailsSubmit}
        isInitialSetup={!currentSession}
      />
    </div>
  );
};

export default App;
