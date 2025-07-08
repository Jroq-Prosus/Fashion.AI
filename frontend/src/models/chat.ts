import { Product, ProductPreview } from "./product";

export interface RetrievalResult {
  retrieved_image_paths: string[];
  detected_labels: string[];
  similarity_scores: number[];
  products: Product[];
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isTyping?: boolean;
  productPreview?: ProductPreview;
  isThinking?: boolean;
  type?: 'store-maps';
  stores?: Array<{
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  }>;
}

export type TrendGeoStore = {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

export type TrendGeoRes = {
  stores: TrendGeoStore[];
};

// Voice-to-text API response type
export interface VoiceToTextResponse {
  code: number;
  message: string;
  data: VoiceToTextData;
}

export interface VoiceToTextData {
  transcript?: string;
  duration?: number;
  language?: string;
  segments?: any[]; // If segments is an array of objects, specify type if known
  task?: string;
  text?: string;
  x_groq?: any; // If x_groq is an object, specify type if known
}