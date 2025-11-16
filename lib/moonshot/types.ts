// lib/moonshot/types.ts

export interface ConversationParams {
  message: string;
  history: any[];
  title?: string;
  vocabulary?: any;
  dialogue?: any;
  targetLanguage: string;
  nativeLanguage: string;
}

export interface AIResponse {
  targetLanguage: string;
  nativeLanguage: string;
  message?: string
}

export interface ScoringParams {
  userMessage: string;
  recentHistory: any[];
  targetLanguage: string;
  vocabulary?: any;
  title?: string;
}

export interface UserScore {
  score: number | null;
  label: string;
  explanation: string;
  improvedResponse: string | null;
  corrections: any;
}

export interface TranslationParams {
  message: string;
  nativeLanguage: string;
}

export interface TranslationResponse {
  messageTranslation: string;
}

export interface StoryFormData {
  topic: string;
  difficulty: string;
  paragraphs: string;
  genre: string;
  grammar: string;
  learningObjectives: string;
}