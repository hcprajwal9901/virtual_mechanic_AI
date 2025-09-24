
import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from '@google/genai';
import type { CarDetails, ChatMessage, MediaData } from './types';
import { MessageAuthor } from './types';
import CarDetailsForm from './components/CarDetailsForm';
import ChatInterface from './components/ChatInterface';

const App: React.FC = () => {
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatRef = useRef<Chat | null>(null);

  const getSystemInstruction = (details: CarDetails) => `
You are "Virtual Mechanic", an expert AI assistant specializing in DIY car diagnosis, repair, and maintenance for cars sold in India from 1970 to the present day. This includes all major brands like Maruti Suzuki, Tata Motors, Mahindra & Mahindra, Hyundai, Toyota, Honda, etc.

Your user has the following car:
Make: ${details.make}
Model: ${details.model}
Year: ${details.year}
Odometer: ${details.odometer} KM
Fuel Type: ${details.fuelType}

Your primary role is to provide clear, actionable, and safe advice. Follow these rules strictly:

1.  **Analyze All Inputs:** If the user provides an image (e.g., of an engine bay, a warning light, a leak) or an audio file (e.g., of a strange engine noise), you MUST analyze it and incorporate your findings into your diagnosis.
2.  **India-Specific Context:** Always frame your advice for the Indian context. Mention local conditions, fuel types (petrol, diesel, CNG), spare parts availability (e.g., MGP for Maruti, local brands), and common issues found on Indian roads.
3.  **Structured Responses:** For troubleshooting or repair guides, structure your answer with the following sections:
    *   **Difficulty:** (Easy, Medium, Hard)
    *   **Tools Required:** (List the specific tools needed)
    *   **Step-by-Step Guide:** (Provide numbered, clear, and concise steps)
4.  **Credible Sources:** Reference advice from credible Indian automotive communities like Team-BHP, official manufacturer service manuals, and common practices from reputable local garages. Use your web search capability to find the most relevant and up-to-date information from these sources.
5.  **Clarifying Questions:** If a user's query is vague (e.g., "my car is making a noise"), ask clarifying questions to diagnose the problem accurately before providing a solution.
6.  **Safety First:** ALWAYS conclude every response that involves a DIY repair or diagnosis with this exact disclaimer:
    "⚠️ Note: Ensure safety first. If unsure, consult a certified mechanic."
7.  **Web Search and Sourcing:** Use your Google Search tool to ground your answers in real-time knowledge. When you use information from a website, you MUST cite it using the grounding information provided.
`;

  const handleCarDetailsSubmit = useCallback(async (details: CarDetails) => {
    setCarDetails(details);
    setIsLoading(true);
    setError(null);
    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: getSystemInstruction(details),
          tools: [{ googleSearch: {} }],
        },
      });
      chatRef.current = chat;
      
      const welcomeMessage: ChatMessage = {
        author: MessageAuthor.MODEL,
        text: `Hello! I'm your Virtual Mechanic. I'm ready to help you with your ${details.year} ${details.make} ${details.model} (${details.fuelType}). What can I assist you with today? You can also send a photo or audio recording of the issue.`,
      };
      setChatHistory([welcomeMessage]);

    } catch (e) {
      const error = e as Error;
      console.error(e);
      setError("Failed to initialize chat session: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = useCallback(async (message: string, media?: MediaData) => {
    if (!chatRef.current) {
      setError("Chat is not initialized.");
      return;
    }

    const userMessage: ChatMessage = { author: MessageAuthor.USER, text: message, media };
    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      let promptText = message;
      if (!promptText.trim() && media) {
        promptText = media.type === 'image' 
            ? "Please analyze this image and identify any potential issues with my car."
            : "Please analyze this audio recording of a car noise and suggest possible causes.";
      }
      
      // FIX: Explicitly type `parts` to allow for both text and inlineData objects.
      // TypeScript was inferring `parts` as `Array<{text: string}>`, causing an error when adding the media part.
      const parts: ({ text?: string; inlineData?: { data: string; mimeType: string; } })[] = [{ text: promptText }];
      if (media) {
        parts.push({
          inlineData: {
            data: media.data,
            mimeType: media.mimeType,
          }
        });
      }

      // FIX: The `sendMessageStream` method for chat expects a `message` property, not `contents`.
      const stream = await chatRef.current.sendMessageStream({ message: parts });
      let modelResponse: ChatMessage = { author: MessageAuthor.MODEL, text: "", sources: [] };
      setChatHistory(prev => [...prev, modelResponse]);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;

        setChatHistory(prev => {
          const newHistory = [...prev];
          const lastMessage = newHistory[newHistory.length - 1];
          if (lastMessage && lastMessage.author === MessageAuthor.MODEL) {
            lastMessage.text += chunkText;
            if (groundingMetadata?.groundingChunks) {
                lastMessage.sources = groundingMetadata.groundingChunks;
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
        setChatHistory(prev => [...prev, errorMessage]);
        setError("Failed to get response from AI: " + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      {!carDetails ? (
        <CarDetailsForm onSubmit={handleCarDetailsSubmit} />
      ) : (
        <ChatInterface
          carDetails={carDetails}
          chatHistory={chatHistory}
          isLoading={isLoading}
          error={error}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
};

export default App;
