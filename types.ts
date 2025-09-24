
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

// Defines the structure for our cascading dropdown data
export interface CarData {
  [make: string]: {
    [model: string]: {
      [year: number]: string[]; // Array of available fuel types
    };
  };
}
