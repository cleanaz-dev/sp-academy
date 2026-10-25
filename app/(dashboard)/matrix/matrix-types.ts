// components/matrix/matrix-types.ts

export interface WordStat {
  id: string;
  languageProfileId: string;
  word: string;
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
  status: "NEW" | "LEARNING" | "REVIEW" | "MASTERED" | string;
  nextReviewDate: Date | string | null;
  partOfSpeech?: string | null;
  translation?: string | null;
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
  | "NOUN_PEOPLE"
  | "EXPRESSION"
  | "VOCABULARY";

export interface EnrichedWordStat extends WordStat {
  cleanWord: string;
  tokens: string[];
  structuralType: StructuralType;
  category: LexicalCategory;
  categoryLabel: string;
  relatedPhrases: WordStat[];
  componentWords: WordStat[];
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
  NOUN_PEOPLE: {
    label: "🧑 People & Title",
    badgeClass:
      "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
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

export function classifyWord(
  word: string,
  dbPos?: string | null
): LexicalCategory {
  if (dbPos) {
    const upper = dbPos.toUpperCase();
    if (upper.includes("PRON")) return "PRONOUN";
    if (upper.includes("VERB")) return "VERB";
    if (upper.includes("GREET")) return "GREETING";
    if (upper.includes("PHRASE") || upper.includes("EXPR")) return "EXPRESSION";
  }

  const w = word.toLowerCase().trim();
  const tokens = w.split(/\s+/);

  const greetings = new Set([
    "bonjour",
    "bonsoir",
    "salut",
    "au revoir",
    "merci",
    "merci beaucoup",
    "s'il vous plaît",
    "s'il te plaît",
    "enchanté",
    "enchantée",
    "bienvenue",
    "à bientôt",
    "bonne journée",
    "bonne nuit",
    "hola",
    "adiós",
    "gracias",
    "por favor",
    "buenos días",
    "buenas tardes",
    "hello",
    "goodbye",
    "please",
    "thank you",
  ]);
  if (greetings.has(w)) return "GREETING";

  const pronouns = new Set([
    "je",
    "j'",
    "tu",
    "il",
    "elle",
    "on",
    "nous",
    "vous",
    "ils",
    "elles",
    "moi",
    "toi",
    "yo",
    "tú",
    "él",
    "ella",
    "nosotros",
    "ellos",
    "i",
    "you",
    "he",
    "she",
    "we",
    "they",
  ]);
  if (pronouns.has(w)) return "PRONOUN";

  const people = new Set([
    "madame",
    "monsieur",
    "mademoiselle",
    "homme",
    "femme",
    "garçon",
    "fille",
    "ami",
    "amie",
    "señor",
    "señora",
    "señorita",
    "hombre",
    "mujer",
  ]);
  if (people.has(w)) return "NOUN_PEOPLE";

  const verbs = new Set([
    "suis",
    "es",
    "est",
    "sommes",
    "êtes",
    "sont",
    "être",
    "ai",
    "as",
    "a",
    "avons",
    "avez",
    "ont",
    "avoir",
    "vais",
    "vas",
    "va",
    "aller",
    "veux",
    "voudrais",
    "peux",
    "parle",
    "mange",
    "bois",
    "comprends",
    "appelle",
    "m'appelle",
    "soy",
    "eres",
    "es",
    "estoy",
    "tengo",
    "quiero",
    "hablo",
  ]);
  if (
    verbs.has(w) ||
    (tokens.length === 2 && pronouns.has(tokens[0]) && verbs.has(tokens[1]))
  ) {
    return "VERB";
  }

  if (tokens.length > 1 || w.includes("'")) {
    return "EXPRESSION";
  }

  return "VOCABULARY";
}