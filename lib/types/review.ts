export interface ReviewMetrics {
  overallScore: number;
  grammarScore: number;
  vocabScore: number;
  pronunciationScore: number | null;
  fluencyScore: number;
}

export interface ReviewMistake {
  type: "grammar" | "vocabulary" | "pronunciation" | "fluency";
  severity: "minor" | "major" | "critical";
  original: string;
  correction: string;
  explanation: string;
  context?: string;
}

export interface ReviewOverallFeedback {
  summary: string;
  strengths: string[];
  focusAreas: string[];
  encouragement: string;
}

export interface ReviewData {
  metrics: ReviewMetrics;
  mistakes: ReviewMistake[];
  overallFeedback: ReviewOverallFeedback;
}

export interface SessionData {
  id: string;
  nativeLanguage: string;
  targetLanguage: string;
  level: string;
  mode: string;
  topic?: string | null;
  duration: number;
}