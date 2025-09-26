import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import type { CarDetails, ChatMessage, MediaData, ChatSession, Settings, Theme } from './types';
import { MessageAuthor } from './types';
import CarDetailsForm from './components/CarDetailsForm';
import ChatInterface from './components/ChatInterface';
import SettingsModal from './components/SettingsModal';

// Define keys for localStorage
const SESSIONS_KEY = 'virtualMechanicSessions';
const SETTINGS_KEY = 'virtualMechanicSettings';
const GARAGE_KEY = 'virtualMechanicGarage';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Failed to parse sessions from localStorage", error);
      return [];
    }
  });

  const [garage, setGarage] = useState<CarDetails[]>(() => {
    try {
      const saved = localStorage.getItem(GARAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error("Failed to parse garage from localStorage", error);
        return [];
    }
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try {
        const saved = localStorage.getItem(SETTINGS_KEY);
        const parsedSettings = saved ? JSON.parse(saved) : { theme: 'system' };
        // Ensure no legacy fontSize property exists
        const { fontSize, ...rest } = parsedSettings;
        return { theme: 'system', ...rest }; // Default theme if not present
    } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        return { theme: 'system' };
    }
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [addCarFlow, setAddCarFlow] = useState(false); // Flag to track if we're adding a car to the garage
  const chatRef = useRef<Chat | null>(null);

  // Derive current session details from the sessions array
  const currentSession = useMemo(() => 
    sessions.find(s => s.id === currentSessionId), 
    [sessions, currentSessionId]
  );
  const carDetails = currentSession?.carDetails;
  const chatHistory = currentSession?.chatHistory;

  // Effect to save all sessions to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error("Failed to save sessions to localStorage", error);
    }
  }, [sessions]);
  
  // Effect to save garage to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(GARAGE_KEY, JSON.stringify(garage));
    } catch (error) {
      console.error("Failed to save garage to localStorage", error);
    }
  }, [garage]);

  // Effect to save settings to localStorage and apply them to the DOM
  useEffect(() => {
      try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
          
          // Apply theme
          const root = window.document.documentElement;
          root.classList.remove('dark', 'light');
          if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              root.classList.add('dark');
          } else {
              root.classList.add('light');
          }

          // Font size is now handled by index.html and a default class.
      } catch (error) {
          console.error("Failed to save settings", error);
      }
  }, [settings]);
  
  // Effect to ensure the current session ID is valid after sessions change.
  // This robustly handles cases where the active session is deleted.
  useEffect(() => {
    if (currentSessionId && !sessions.some(s => s.id === currentSessionId)) {
      setCurrentSessionId(null);
      chatRef.current = null;
    }
  }, [sessions, currentSessionId]);
  
  const getSystemInstruction = (details: CarDetails) => `
You are "Virtual Mechanic", an expert AI assistant specializing in DIY car diagnosis, repair, and maintenance for cars sold in India from 1970 to the present day. This includes all major brands like Maruti Suzuki, Tata Motors, Mahindra & Mahindra, Hyundai, Toyota, Honda, etc.

Your user has the following car:
Make: ${details.make}
Model: ${details.model}
Year: ${details.year}
Odometer: ${details.odometer} KM
Fuel Type: ${details.fuelType}

Your primary role is to provide the most accurate, up-to-date, and safe advice. Follow these rules strictly:

1.  **Prioritize Web Search for Accuracy:** For any technical query (e.g., repair steps, torque specs, part numbers, fluid types), you MUST use the Google Search tool to find the most current and precise information. Do not rely solely on your pre-existing knowledge. Accuracy is paramount.
2.  **Analyze All User Inputs (Image & Audio):**
    *   **For Images:** When a user uploads a photo, perform a detailed visual analysis. Your response should:
        1.  **Identify Components:** Clearly name the primary car parts visible in the image (e.g., "This photo shows the alternator, the serpentine belt, and the power steering reservoir.").
        2.  **Diagnose Visual Issues:** Actively look for and describe any potential problems like fluid leaks (note the color and location), frayed wires, cracked hoses, corrosion on battery terminals, worn belts, or any signs of damage or unusual wear.
        3.  **Contextualize:** Directly relate your visual findings to the user's text query. If they ask to identify a part, focus on that. If they mention a problem, use the photo to confirm or deny it.
    *   **For Audio:** When a user uploads a recording, analyze the sound. Describe its characteristics (e.g., "a high-pitched squeal," "a rhythmic clicking," "a deep grinding noise") and suggest potential causes based on when the sound occurs.
    *   **You MUST incorporate your findings from the media into your overall diagnosis.**
3.  **Contextual Diagnostic Questioning:** If a user's query is about diagnosing a specific problem (e.g., "my car won't start," "there's a weird noise"), you MUST ask clarifying questions one at a time to gather sufficient information before providing a solution. Do not jump to a diagnosis. Your questions should be logical follow-ups based on the user's statements.
    *   **Analyze the User's Input:** Carefully read the user's description of the problem.
    *   **Ask the Most Relevant Question Next:** Based on their input, formulate a single, targeted question to narrow down the possibilities.
    *   **Wait for the Answer:** Wait for the user to respond before asking another question.
    *   **Example Scenarios:**
        *   If the user says, **"My car is making a squealing noise,"** a good follow-up question would be, *"When do you hear the squealing noise? Is it when you start the car, when you turn the steering wheel, or when you apply the brakes?"*
        *   If the user says, **"My car won't start,"** a good first question would be, *"When you turn the key, what happens? Do you hear a clicking sound, does the engine crank slowly, or is there no sound at all?"*
        *   If the user says, **"The check engine light is on,"** a logical next question would be, *"Have you noticed any other symptoms along with the light, like poor performance, strange noises, or smoke?"*
    *   **Continue this process** for a few turns until you have a clear picture of the issue. Only then should you provide a diagnosis or suggest next steps.
4.  **DIY Confirmation:** When a specific repair is identified, you must first ask the user if they wish to perform it themselves. Use the special format \`[PROMPT_BUTTONS]Your question here.|Affirmative answer.|Negative answer.\`
    *   Example: \`[PROMPT_BUTTONS]The issue seems to be a faulty spark plug, which is an easy repair. Would you like a step-by-step guide to replace it yourself?|Yes, show me how.|No, I'd rather not.\`
    *   DO NOT provide repair steps until the user responds positively. If the user selects the negative option, advise them to consult a professional mechanic.
5.  **Structured Repair Guides (On User Confirmation Only):** If the user confirms they want to proceed with the repair, THEN you provide a guide structured with these sections:
    *   **Difficulty:** (Easy, Medium, Hard)
    *   **Tools & Parts Required:** This section MUST be broken down into two special collapsible blocks.
        *   **Parts Block:** List all required parts. You MUST use your search tool to find and include direct purchase links from Indian e-commerce sites (like Boodmo, Amazon.in, etc.). Wrap this entire list inside \`[PARTS_BUTTON]...[/PARTS_BUTTON]\`.
        *   **Tools Block:** List all required tools. You MUST use your search tool to find generic purchase links for tool categories from Indian e-commerce sites. Wrap this entire list inside \`[TOOLS_BUTTON]...[/TOOLS_BUTTON]\`.
    *   **Step-by-Step Guide:** Provide numbered, clear, and concise steps.
6.  **Part Identification:** When mentioning a specific car part in your guides, you MUST provide a simple description of its likely appearance and location to help the user identify it. For example: "The air filter is usually housed in a large black plastic box near the top of the engine."
7.  **India-Specific Context:** Always frame your advice for the Indian context. Mention local conditions, fuel types (petrol, diesel, CNG), spare parts availability (e.g., MGP for Maruti, local brands), and common issues found on Indian roads.
8.  **Cite Your Sources:** When you use information from a website found via your search tool, you MUST cite the source URL and title using the grounding information provided.
9.  **Safety First:** ALWAYS conclude every response that involves a DIY repair or diagnosis with this exact disclaimer:
    "⚠️ Note: Ensure safety first. If unsure, consult a certified mechanic."
`;

  const initializeChat = useCallback(async (details: CarDetails, history: ChatMessage[]) => {
      setIsLoading(true);
      setError(null);
      chatRef.current = null; // Reset previous chat instance
      try {
        if (!process.env.API_KEY) {
          throw new Error("API key is not configured.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const sdkHistory = history.map(message => {
            const role = message.author === MessageAuthor.USER ? 'user' : 'model';
            const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; }})[] = [];
            if(message.text) parts.push({ text: message.text });
            if(message.media) parts.push({ inlineData: { mimeType: message.media.mimeType, data: message.media.data } });
            return { role, parts };
        }).filter(item => item.parts.length > 0);

        const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          history: sdkHistory,
          config: {
            systemInstruction: getSystemInstruction(details),
            tools: [{ googleSearch: {} }],
          },
        });
        chatRef.current = chat;
        
        if (history.length === 0) {
            const welcomeMessage: ChatMessage = {
                author: MessageAuthor.MODEL,
                text: `Hello! I'm your Virtual Mechanic. I'm ready to help you with your ${details.year} ${details.make} ${details.model} (${details.fuelType}). What can I assist you with today? You can also send a photo or audio recording of the issue.`,
            };
            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, chatHistory: [welcomeMessage], lastUpdated: Date.now() } : s));
        }
      } catch (e) {
        const error = e as Error;
        console.error(e);
        setError("Failed to initialize chat session: " + error.message);
      } finally {
        setIsLoading(false);
      }
  }, [currentSessionId]);

  // Effect to initialize chat when a session is selected
  useEffect(() => {
    if (currentSession) {
      initializeChat(currentSession.carDetails, currentSession.chatHistory);
    }
  }, [currentSession, initializeChat]); // Depend on the derived session object

  const handleCarDetailsSubmit = useCallback(async (details: CarDetails) => {
    // If this submission came from the "Add Car" flow, add the car to the garage.
    if (addCarFlow) {
        const isDuplicate = garage.some(car => 
            car.make === details.make && 
            car.model === details.model && 
            car.year === details.year
        );
        if (!isDuplicate) {
            setGarage(prev => [...prev, details]);
        }
        setAddCarFlow(false); // Reset the flow flag
    }

    const newSession: ChatSession = {
        id: Date.now().toString(),
        carDetails: details,
        chatHistory: [],
        lastUpdated: Date.now()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, [addCarFlow, garage]);
  
  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsSettingsModalOpen(false); // Close settings on selection
  };

  const handleSendMessage = useCallback(async (message: string, media?: MediaData) => {
    if (!chatRef.current) {
      setError("Chat is not initialized.");
      return;
    }
    if (!currentSessionId) {
      setError("No active session.");
      return;
    }

    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: message, media };
    
    const updateHistory = (updater: (prevHistory: ChatMessage[]) => ChatMessage[]) => {
      setSessions(prevSessions =>
        prevSessions.map(s =>
          s.id === currentSessionId
            ? { ...s, chatHistory: updater(s.chatHistory), lastUpdated: Date.now() }
            : s
        ).sort((a, b) => b.lastUpdated - a.lastUpdated) // Re-sort on update
      );
    };

    updateHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      let promptText = message;
      if (!promptText.trim() && media) {
        promptText = media.type === 'image' 
            ? "Please analyze this image and identify any potential issues with my car."
            : "Please analyze this audio recording of a car noise and suggest possible causes.";
      }
      
      const parts: ({ text: string } | { inlineData: { data: string; mimeType: string; } })[] = [{ text: promptText }];

      if (media) {
        parts.push({
          inlineData: {
            data: media.data,
            // FIX: Corrected property name from mediaType to mimeType to match the MediaData interface.
            mimeType: media.mimeType,
          }
        });
      }

      const stream = await chatRef.current.sendMessageStream({ message: parts });
      const modelResponse: ChatMessage = { author: MessageAuthor.MODEL, text: "", sources: [] };
      updateHistory(prev => [...prev, modelResponse]);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
        
        updateHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage && lastMessage.author === MessageAuthor.MODEL) {
            lastMessage.text += chunkText;
            if (groundingMetadata?.groundingChunks) {
                lastMessage.sources = (lastMessage.sources || []).concat(groundingMetadata.groundingChunks);
            }
          }
          return newHistory;
        });
      }
    } catch (e) {
        const error = e as Error;
        console.error(e);
        const errorMessage: ChatMessage = {
            author: MessageAuthor.MODEL,
            text: "Sorry, I encountered an error. Please try again. " + error.message
        };
        updateHistory(prev => [...prev, errorMessage]);
        setError("Failed to get response from AI: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  const handleNewDiagnosis = () => {
      setCurrentSessionId(null);
      chatRef.current = null;
  };
  
  const handleClearHistory = () => {
      setSessions([]);
      // Do not clear the garage, only sessions
      setCurrentSessionId(null);
      chatRef.current = null;
      setIsSettingsModalOpen(false);
  };
  
  const handleDeleteSession = useCallback((sessionIdToDelete: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionIdToDelete));
  }, []);

  // Triggered by the "+" button in the garage
  const handleAddNewCar = () => {
      setAddCarFlow(true); // Set the flag to add the next car to the garage
      handleNewDiagnosis();
      setIsSettingsModalOpen(false);
  };
  
  // Triggered by deleting a car from the garage list
  const handleDeleteCar = useCallback((carToDelete: CarDetails) => {
    // 1. Remove car from the garage
    setGarage(prevGarage => prevGarage.filter(car => 
        !(car.make === carToDelete.make &&
          car.model === carToDelete.model &&
          car.year === carToDelete.year)
    ));
    // 2. Remove all sessions associated with that car
    setSessions(prevSessions => prevSessions.filter(session => 
        !(session.carDetails.make === carToDelete.make &&
          session.carDetails.model === carToDelete.model &&
          session.carDetails.year === carToDelete.year)
    ));
  }, []);
  
  // Triggered by clicking a car in the garage to start a new chat
  const handleStartDiagnosisFromGarage = (details: CarDetails) => {
    handleCarDetailsSubmit(details);
    setIsSettingsModalOpen(false);
  };


  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {!currentSession || !carDetails || !chatHistory ? (
        <CarDetailsForm 
          onSubmit={handleCarDetailsSubmit} 
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />
      ) : (
        <ChatInterface
          carDetails={carDetails}
          chatHistory={chatHistory}
          isLoading={isLoading}
          error={error}
          onSendMessage={handleSendMessage}
          onNewDiagnosis={handleNewDiagnosis}
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
            onSessionSelect={handleSelectSession}
            onClearHistory={handleClearHistory}
            onDeleteSession={handleDeleteSession}
            onAddNewCar={handleAddNewCar}
            onDeleteCar={handleDeleteCar}
            onStartDiagnosisFromGarage={handleStartDiagnosisFromGarage}
            isInitialSetup={!currentSession}
        />
    </div>
  );
};

export default App;