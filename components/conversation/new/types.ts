import type { SpeechAceResults } from "@/lib/moonshot/types";
export interface Suggestion {
  targetLanguage: string;
  nativeLanguage: string;
}

export interface UseSuggestionsReturn {
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;
  getSuggestions: () => Promise<void>;
  speakPhrase: (text: string) => void;
  usePhrase: (text: string) => void;
  conversationHistory: Array<{ role: string; content: string }>;
}

export interface CorrectionDetail {
  correction: string;
  reason?: string;
}

export interface Corrections {
  genderAgreement?: string | CorrectionDetail;
  vocabulary?: string | CorrectionDetail;
  article?: string | CorrectionDetail;
  finalNotes?: string;
  additionalNotes?: string;
}

export interface ImprovementTooltipProps {
  improvedResponse: string;
  originalText: string;
  corrections?: Corrections;
  speakPhrase?: (text: string) => void; // Make it optional or provide default
  pronunciationScore?: SpeechAceResults
}

export type VoiceGender = 'male' | 'female';

export interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  label?: 'Excellent' | 'Great' | 'Good' | 'OK' | 'Poor';
  improvedResponse?: string;
  corrections?: Corrections;
  score?: number;
  timestamp?: number;
  pronunciationScore?: SpeechAceResults
}

// Suggestions system
export interface Suggestion {
  targetLanguage: string;
  nativeLanguage: string;
}

// Corrections for improved responses
export interface CorrectionDetail {
  correction: string;
  reason?: string;
}

export interface Corrections {
  genderAgreement?: string | CorrectionDetail;
  vocabulary?: string | CorrectionDetail;
  article?: string | CorrectionDetail;
  finalNotes?: string;
}

// Component props
export interface VoiceGenderToggleProps {
  voiceGender: VoiceGender;
  onToggle: () => void;
}

export interface MessageBubbleProps {
  message: Message;
  voiceGender: VoiceGender;
  aiAvatarMaleUrl: string;
  aiAvatarFemaleUrl: string;
  userAvatarUrl?: string;
  speakPhrase: (text: string) => void;
}

export interface InputControlsProps {
  textInput: string;
  isRecording: boolean;
  isProcessing: boolean;
  conversationStarted: boolean;
  conversationRecordId: string | null;
  onTextChange: (value: string) => void;
  onSend: (text: string) => void;
  onToggleRecording: () => void;
  onStartConversation: () => void;
}

export interface SuggestionsPanelProps {
  conversationHistory: Message[];
  getSuggestions: () => void;
  isLoadingSuggestions: boolean;
  suggestions: Suggestion[];
  error: string | null;
  speakPhrase: (text: string) => void;
  usePhrase: (text: string) => void;
}

export interface ImprovementTooltipProps {
  improvedResponse: string;
  originalText: string;
  corrections?: Corrections;
  speakPhrase?: (text: string) => void;
}

// Hook return type
export interface UseConversationReturn {
  // State
  voiceGender: VoiceGender;
  conversationHistory: Message[];
  textInput: string;
  isRecording: boolean;
  isProcessing: boolean;
  isDeleting: boolean;
  isSaving: boolean;
  conversationStarted: boolean;
  conversationRecordId: string | null;
  translationResult: string | null;
  error: string | null;
  originalText: string;
  
  // Actions
  toggleVoiceGender: () => void;
  handleStartConversation: () => void;
  handleTranslation: (text: string) => void;
  handleSendMessage: (text: string) => void;
  toggleRecording: () => void;
  clearConversationHistory: () => void;
  analyzeAndSaveConversation: () => void;
  speakPhrase: (text: string) => void;
  usePhrase: (text: string) => void;
}

// Utility types
export type ClassValue = string | number | boolean | undefined | null;