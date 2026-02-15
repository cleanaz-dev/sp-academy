// lib/groq/types.ts


export interface ConversationParams {
  message: string;
  history: any[];
  title?: string;
  scenario?: string; // <-- Add this
  vocabulary?: any[]; // Typed as array usually helps
  dialogue?: any[];   // Typed as array usually helps
  targetLanguage: string;
  nativeLanguage: string;
}
export interface SpeechAceResults {
  score:  number;
  cerfScore: string;
  fluency?: string;
}

export interface AIResponse {
  targetLanguage: string;
  nativeLanguage: string;
  message?: string;
  isCompleted?: boolean;
  userMessageTranslation?: string;
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

export interface CourseCreationParams {
  topic: string
  prompt: string
}

