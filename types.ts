import { GroundingChunk } from "@google/genai";

export interface CarDetails {
  make: string;
  model: string;
  year: string;
  odometer: string;
  fuelType: string;
}

export enum MessageAuthor {
  USER = "user",
  MODEL = "model",
}

export interface MediaData {
    type: 'image' | 'audio';
    data: string; // Base64 encoded data
    mimeType: string;
}

export interface ChatMessage {
  author: MessageAuthor;
  text: string;
  sources?: GroundingChunk[];
  media?: MediaData;
}

// Defines a complete, self-contained chat session
export interface ChatSession {
  id: string; // Unique ID, e.g., a timestamp
  carDetails: CarDetails;
  chatHistory: ChatMessage[];
  lastUpdated: number; // Timestamp for sorting
}

// App personalization settings
export type Theme = 'light' | 'dark' | 'system';

export interface Settings {
    theme: Theme;
}


// Defines the structure for our cascading dropdown data
export interface CarData {
  [make: string]: {
    [model: string]: {
      [year: number]: string[]; // Array of available fuel types
    };
  };
}