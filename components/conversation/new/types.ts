export type VoiceGender = "male" | "female";
export type ClassValue = string | number | boolean | undefined | null;

export interface PhonemeAssessment {
  phoneme: string;
  accuracyScore: number;
}

export interface WordAssessment {
  word: string;
  accuracyScore: number;
  errorType?: "None" | "Omission" | "Insertion" | "Mispronunciation";
  phonemes?: PhonemeAssessment[];
}

export interface PronunciationScore {
  score: number; // Azure overall PronunciationScore (0-100)
  accuracyScore?: number;
  fluencyScore?: number;
  completenessScore?: number;
  prosodyScore?: number;
  words?: WordAssessment[];
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

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  translation?: string;
  score?: number;
  label?: "Excellent" | "Great" | "Good" | "OK" | "Poor";
  improvedResponse?: string;
  corrections?: Corrections;
  isTyping?: boolean;
  timestamp?: number;
  pronunciationScore?: PronunciationScore | null;
  isAnalyzingPronunciation?: boolean;
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

export interface ImprovementTooltipProps {
  improvedResponse: string;
  originalText: string;
  corrections?: Corrections;
  speakPhrase?: (text: string) => void;
  pronunciationScore?: PronunciationScore | null;
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
  audioBase64Map: Record<string, string>;
  createAudioUrl: (base64: string) => string;
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
  targetLanguage: string;
}

export interface SuggestionsPanelProps {
  conversationHistory: Message[];
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
  suggestions: Suggestion[];
  isLoadingSuggestions: boolean;
  isGeneratingAudio: boolean;
  isMuted: boolean;
  userMessage: string;
  isAnalyzingSpeech: boolean;
  isMobile: boolean;
  audioBase64Map: Record<string, string>;

  // Actions / Helpers
  handleConversation: (message: string, audioBlob?: Blob) => Promise<void>;
  handleStartConversation: () => Promise<void>;
  toggleRecording: () => Promise<void>;
  clearConversationHistory: () => Promise<void>;
  getSuggestions: () => Promise<void>;
  analyzeAndSaveConversation: () => Promise<void>;
  usePhrase: (phrase: string) => void;
  speakPhrase: (text: string) => void;
  toggleVoiceGender: (checked: boolean) => void;
  toggleMute: () => void;
  setTextInput: (value: string) => void;
  setError: (error: string | null) => void;
  createAudioUrl: (base64: string) => string;
}