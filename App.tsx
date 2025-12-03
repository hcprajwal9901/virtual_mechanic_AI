import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CarDetails, ChatMessage, MediaData, ChatSession, Settings } from './types';
import { MessageAuthor } from './types';
import CarDetailsForm from './components/CarDetailsForm';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';

// LocalStorage keys
const SESSIONS_KEY = 'virtualMechanicSessions';
const SETTINGS_KEY = 'virtualMechanicSettings';
const GARAGE_KEY = 'virtualMechanicGarage';
const CACHE_PREFIX = 'vm_cache_'; // simple response cache key prefix

// small helper: compute SHA-256 hex of a string (used for cache keys)
async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const bytes = Array.from(new Uint8Array(hash));
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

const App: React.FC = () => {
  // -------------------------
  // State
  // -------------------------
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || "[]"); }
    catch { return []; }
  });

  const [garage, setGarage] = useState<CarDetails[]>(() => {
    try { return JSON.parse(localStorage.getItem(GARAGE_KEY) || "[]"); }
    catch { return []; }
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"theme":"system"}'); }
    catch { return { theme: "system" }; }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [addCarFlow, setAddCarFlow] = useState(false);

  // API key from Vite env
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  // chat session object from SDK
  const chatRef = useRef<any>(null);

  // We'll hold the model instance for reuse (to avoid re-creating model per message)
  const modelRef = useRef<any>(null);

  // Keep abort controller for in-flight request (so we can cancel when user sends new message)
  const inflightAbort = useRef<AbortController | null>(null);

  const currentSession = useMemo(
    () => sessions.find(s => s.id === currentSessionId),
    [sessions, currentSessionId]
  );

  // Persist to localStorage
  useEffect(() => localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)), [sessions]);
  useEffect(() => localStorage.setItem(GARAGE_KEY, JSON.stringify(garage)), [garage]);
  useEffect(() => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)), [settings]);

  // theme
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    const isDark = settings.theme === "dark" ||
      (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.add(isDark ? "dark" : "light");
  }, [settings]);

  // system prompt builder
  const getSystemInstruction = (details: CarDetails) => `
You are a Virtual Mechanic — Diagnose vehicles in India.
Car: ${details.year} ${details.make} ${details.model}
Fuel: ${details.fuelType}
Odometer: ${details.odometer}
Always prioritize safety. Use Indian context for parts and shops.
`;

  // -------------------------
  // Safe updater helper
  // -------------------------
  const safeUpdateSessionHistory = useCallback((updater: (oldHistory: ChatMessage[]) => ChatMessage[]) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id !== currentSessionId) return session;
        const oldHistory = Array.isArray(session.chatHistory) ? session.chatHistory : [];
        const updatedHistory = (() => {
          try {
            return updater(oldHistory || []);
          } catch {
            return oldHistory;
          }
        })();
        return {
          ...session,
          chatHistory: Array.isArray(updatedHistory) ? updatedHistory : oldHistory,
          lastUpdated: Date.now()
        };
      })
    );
  }, [currentSessionId]);

  // -------------------------
  // Initialize Chat (with fixes)
  // -------------------------
  const initializeChat = useCallback(async (details: CarDetails, history: ChatMessage[]) => {
    setIsLoading(true);
    setError(null);
    chatRef.current = null;
    modelRef.current = null;

    try {
      if (!API_KEY) throw new Error("API key missing — add VITE_GEMINI_API_KEY");

      const genAI = new GoogleGenerativeAI(API_KEY);

      // Create model once and reuse
      const model = genAI.getGenerativeModel({
        model: "gemini-pro",
        systemInstruction: getSystemInstruction(details)
      });
      modelRef.current = model;

      // Filter initial history: GEMINI requires the first content to be a user message.
      // Keep only user messages (we'll append model replies after chat starts).
      const filteredUserHistory = (Array.isArray(history) ? history : []).filter(h => h.author === MessageAuthor.USER);

      // Convert to SDK history parts form (only user parts)
            const sdkHistory = filteredUserHistory.map(msg => ({
              role: 'user',
              parts: msg.media
                ? [
                    { text: msg.text || '' },
                    { inlineData: { data: msg.media.data, mimeType: msg.media.mimeType } }
                  ]
                : [{ text: msg.text || '' }]
            }));
      
            // Start chat with user-only history (safe)
            const chatSession = model.startChat({
              history: sdkHistory as any
            });

      chatRef.current = chatSession;

      // If no prior history, append a welcome model message in your sessions state **after** chat is ready.
      if (!Array.isArray(history) || history.length === 0) {
        const welcome: ChatMessage = {
          author: MessageAuthor.MODEL,
          text: `Hello! I'm your Virtual Mechanic. How can I assist with your ${details.year} ${details.make} ${details.model}?`,
        };
        // Add welcome as the first model reply (not part of sdkHistory)
        safeUpdateSessionHistory(() => [welcome]);
      }
    } catch (e: any) {
      setError("Chat setup failed: " + e.message);
    } finally {
      setIsLoading(false);
    }
  }, [API_KEY, safeUpdateSessionHistory]);

  useEffect(() => {
    if (currentSession) initializeChat(currentSession.carDetails, currentSession.chatHistory || []);
  }, [currentSession, initializeChat]);

  // -------------------------
  // Caching helpers
  // -------------------------
  const getCache = (key: string) => {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const setCache = (key: string, value: any) => {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
    } catch {
      // ignore storage errors (quota etc.)
    }
  };

  // -------------------------
  // sendMessage with streaming, caching, media support, abort & dedupe
  // -------------------------
  const handleSendMessage = useCallback(async (text: string, media?: MediaData) => {
    if (!modelRef.current || !chatRef.current) {
      setError("Chat not initialized.");
      return;
    }
    if (!currentSessionId) {
      setError("No active session.");
      return;
    }

    // Create user message and append locally
    const userMsg: ChatMessage = { author: MessageAuthor.USER, text, media };
    safeUpdateSessionHistory(prev => [...prev, userMsg]);

    setIsLoading(true);
    setError(null);

    // Build canonical request string to hash for cache/dedupe
    const canonical = JSON.stringify({
      text: text || '',
      media: media ? { mimeType: media.mimeType, sizeHint: media.data?.length ?? 0 } : null,
      sessionCar: currentSession?.carDetails ?? null
    });

    // compute cache key
    const cacheKey = await sha256Hex(canonical);

    // If we have cached response, return it immediately (and still optionally refresh in background)
    const cached = getCache(cacheKey);
    if (cached) {
      // append model cached response
      const cachedModelMsg: ChatMessage = { author: MessageAuthor.MODEL, text: cached.text, sources: cached.sources || [] };
      safeUpdateSessionHistory(prev => [...prev, cachedModelMsg]);
      setIsLoading(false);
      return;
    }

    // Abort any in-flight request (prevent race)
    if (inflightAbort.current) {
      try { inflightAbort.current.abort(); } catch { /* ignore */ }
      inflightAbort.current = null;
    }
    const abortController = new AbortController();
    inflightAbort.current = abortController;

    try {
      // Prepare parts: first is text prompt (or media-directed prompt)
      let userPrompt = text;
      if ((!userPrompt || userPrompt.trim() === '') && media) {
        // If only media, send a descriptive prompt
        if (media.mimeType.startsWith('image')) {
          userPrompt = "Please analyze this image and identify any potential issues with my vehicle. Mention visible parts and likely causes.";
        } else if (media.mimeType.startsWith('audio')) {
          userPrompt = "Please analyze this audio recording of a car noise. Describe the sound characteristics and likely causes.";
        } else {
          userPrompt = "Please analyze the attached media and respond.";
        }
      }

      // Build parts array for streaming API (text + inline media if present)
      const parts: any[] = [{ text: userPrompt }];

      if (media) {
        parts.push({
          inlineData: { data: media.data, mimeType: media.mimeType }
        });
      }

      // Use SDK chat session sendMessageStream which returns async iterable of chunks
      // Streaming response (Gemini 1.5 correct format)
        const stream = await chatRef.current.sendMessageStream(
          parts,                      // <-- array of parts
          { signal: abortController.signal }
        );


      // Create placeholder model message and append to history
      safeUpdateSessionHistory(prev => {
        const newMsg: ChatMessage = { author: MessageAuthor.MODEL, text: "", sources: [] };
        return [...prev, newMsg];
      });

      // accumulate text and sources
      let accumulatedText = "";
      const groundingChunks: any[] = [];

      // stream chunks
      for await (const chunk of stream) {
        if (abortController.signal.aborted) break;

        const chunkText = (chunk.text ?? "");
        accumulatedText += chunkText;

        // collect grounding metadata if available
        const grounding = chunk.candidates?.[0]?.groundingMetadata;
        if (grounding?.groundingChunks) {
          groundingChunks.push(...grounding.groundingChunks);
        }

        // update the last model message in the session with incremental text
        safeUpdateSessionHistory(prev => {
          if (!Array.isArray(prev) || prev.length === 0) return prev;
          const copy = [...prev];
          // find last index with author MODEL (search backwards)
          for (let i = copy.length - 1; i >= 0; i--) {
            if (copy[i].author === MessageAuthor.MODEL) {
              const old = copy[i];
              copy[i] = {
                ...old,
                text: (old.text || '') + chunkText,
                sources: Array.from(new Set([...(old.sources || []), ...groundingChunks]))
              };
              break;
            }
          }
          return copy;
        });
      }

      // final text assembled, save to cache
      setCache(cacheKey, { text: accumulatedText, sources: groundingChunks });

    } catch (e: any) {
      if (e?.name === 'AbortError') {
        // request was aborted — don't treat as fatal
        setError(null);
      } else {
        // append an error model message
        safeUpdateSessionHistory(prev => [...prev, { author: MessageAuthor.MODEL, text: "Error: " + e.message }]);
        setError("Failed to get response from AI: " + e.message);
      }
    } finally {
      setIsLoading(false);
      inflightAbort.current = null;
    }

  }, [currentSessionId, currentSession, API_KEY, safeUpdateSessionHistory]);

  // -------------------------
  // New chat session submission
  // -------------------------
  const handleCarDetailsSubmit = (details: CarDetails) => {
    if (addCarFlow && !garage.some(c =>
      c.make === details.make &&
      c.model === details.model &&
      c.year === details.year
    )) {
      setGarage(prev => [...prev, details]);
    }
    setAddCarFlow(false);

    const newSession: ChatSession = {
      id: Date.now().toString(),
      carDetails: details,
      chatHistory: [],
      lastUpdated: Date.now(),
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      {!API_KEY && (
        <div className="text-red-500 text-center p-2 bg-red-100">
          API key missing — add VITE_GEMINI_API_KEY to your .env
        </div>
      )}

      {!currentSession ? (
        <CarDetailsForm
          onSubmit={handleCarDetailsSubmit}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
      ) : (
        <ChatInterface
          carDetails={currentSession.carDetails}
          chatHistory={currentSession.chatHistory}
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
        onDeleteSession={id => setSessions(prev => prev.filter(s => s.id !== id))}
        onAddNewCar={() => setAddCarFlow(true)}
        onDeleteCar={car =>
          setGarage(prev =>
            prev.filter(c =>
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
