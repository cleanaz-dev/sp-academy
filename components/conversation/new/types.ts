import type { SpeechAceResults } from "@/lib/moonshot/types";

// 🔥 NEW: Word-level pronunciation scoring
export interface WordScore {
  word: string;
  quality_score: number; // 0-100
  phone_score_list?: Array<{
    phone: string;
    quality_score: number;
    sound_most_like?: string;
  }>;
  syllable_score_list?: any[];
  stress_level?: number;
  sound_most_like?: string;
}

// 🔥 UPDATED: Add words array to pronunciation score
export interface PronunciationScore {
  score: number;
  cerf_score: string;
  words?: WordScore[]; // NEW
  overall_fluency?: number;
}

export interface Suggestion {
  targetLanguage: string;
  nativeLanguage: string;
}

export interface UseSuggestionsReturn {
  suggestions: Suggestion[];
  isLoading: boolean;
  error: string | null;
  getSuggestions: () => Promise<void>;
  clearSuggestions: () => void;
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
  speakPhrase?: (text: string) => void;
  pronunciationScore?: PronunciationScore; // 🔥 CHANGED from SpeechAceResults
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
  pronunciationScore?: PronunciationScore;
  isTyping?: boolean; // 👈 add this
}

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

export type ClassValue = string | number | boolean | undefined | null;