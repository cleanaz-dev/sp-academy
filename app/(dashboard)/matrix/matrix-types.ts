// components/matrix/matrix-types.ts

export interface WordStat {
  id: string;
  languageProfileId: string;
  word: string;
  wordType: "WORD" | "PHRASE" | string;
  partOfSpeech: string;
  translation: string | null;
  lemma: string | null;
  grammaticalGender: "M" | "F" | string | null;
  componentWords: string[];
  audioMaleKey: string | null;
  audioFemaleKey: string | null;
  seenCount: number;
  firstSeenAt: Date | string;
  lastSeenAt: Date | string;
  heardCount: number;
  lastHeardAt: Date | string | null;
  tappedCorrect: number;
  tappedWrong: number;
  lastTappedAt: Date | string | null;
  spokenAttempts: number;
  avgSpokenScore: number | null;
  lastSpokenAt: Date | string | null;
  masteryScore: number;
  status: "NEW" | "LEARNING" | "FAMILIAR" | "MASTERED" | string;
  nextReviewDate: Date | string | null;
}

export interface LanguageProfile {
  languageCode: string;
  wordStats: WordStat[];
}

export interface MatrixData {
  languageProfiles: LanguageProfile[];
}

export type StructuralType = "WORD" | "PHRASE";
export type ViewMode = "ALL" | "WORDS" | "PHRASES" | "FAMILIES";
export type SortByOption = "recent" | "mastery" | "alpha" | "score";

export type LexicalCategory =
  | "GREETING"
  | "PRONOUN"
  | "VERB"
  | "NOUN"
  | "ADJECTIVE"
  | "EXPRESSION"
  | "VOCABULARY";

export interface EnrichedWordStat extends WordStat {
  cleanWord: string;
  tokens: string[];
  structuralType: StructuralType;
  category: LexicalCategory;
  categoryLabel: string;
  relatedPhrases: WordStat[];
  linkedComponentWords: WordStat[];
  sameLemmaWords: WordStat[];
}

export interface SessionScore {
  overall: number;
  accuracy: number | null;
  fluency: number | null;
}

export const CATEGORY_META: Record<
  LexicalCategory,
  { label: string; badgeClass: string }
> = {
  GREETING: {
    label: "👋 Greeting & Social",
    badgeClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  PRONOUN: {
    label: "👤 Pronoun",
    badgeClass:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  VERB: {
    label: "⚡ Verb & Action",
    badgeClass:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
  NOUN: {
    label: "🏷️ Noun",
    badgeClass:
      "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  },
  ADJECTIVE: {
    label: "🎨 Adjective",
    badgeClass:
      "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
  },
  EXPRESSION: {
    label: "💬 Phrase / Chunk",
    badgeClass:
      "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  VOCABULARY: {
    label: "🧱 Core Word",
    badgeClass:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
  },
};

/**
 * Pure DB-driven mapper: reads `partOfSpeech` and `wordType` directly from Prisma.
 * Zero hardcoded language word lists!
 */
export function classifyWord(
  _word: string,
  dbPos?: string | null,
  dbWordType?: string | null
): LexicalCategory {
  const upper = (dbPos || "").toUpperCase();

  if (upper.includes("GREET") || upper.includes("INTERJ")) return "GREETING";
  if (upper.includes("PRON") || upper.includes("DET")) return "PRONOUN";
  if (upper.includes("VERB") || upper.includes("AUX")) return "VERB";
  if (upper.includes("NOUN") || upper.includes("PROPN")) return "NOUN";
  if (upper.includes("ADJ")) return "ADJECTIVE";
  if (
    upper.includes("EXPR") ||
    upper.includes("PHRASE") ||
    dbWordType === "PHRASE"
  ) {
    return "EXPRESSION";
  }

  return "VOCABULARY";
}