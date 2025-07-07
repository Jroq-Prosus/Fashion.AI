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
}