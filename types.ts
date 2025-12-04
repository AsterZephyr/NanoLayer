export enum MessageRole {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
  relatedImageId?: string; // Links a message to a specific generated image
}

export enum LayerType {
  ORIGINAL = 'ORIGINAL',
  SUBJECT = 'SUBJECT',
  BACKGROUND = 'BACKGROUND'
}

export interface Layer {
  id: string;
  type: LayerType;
  base64Data: string;
  mimeType: string;
  promptUsed: string;
  createdAt: number;
  parentId?: string; // If subject/background, links to original
}

export interface GenerationState {
  isGenerating: boolean;
  currentTask: string | null; // e.g., "Generating base image...", "Splitting layers..."
}