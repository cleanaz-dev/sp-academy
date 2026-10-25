// components/matrix/matrix-types.ts

export interface WordStat {
  id: string;
  languageProfileId: string;
  word: string;

  // Linguistic Metadata (From Prisma WordStat)
  wordType?: "WORD" | "PHRASE" | string;
  partOfSpeech?: string | null;
  translation?: string | null;
  lemma?: string | null;
  grammaticalGender?: "M" | "F" | string | null;
  componentWords?: string[];
  audioMaleKey?: string | null;
  audioFemaleKey?: string | null;

  // Passive Metrics
  seenCount: number;
  firstSeenAt: Date | string;
  lastSeenAt: Date | string;
  heardCount: number;
  lastHeardAt: Date | string | null;

  // Active Metrics
  tappedCorrect: number;
  tappedWrong: number;
  lastTappedAt: Date | string | null;

  // Production Metrics
  spokenAttempts: number;
  avgSpokenScore: number | null;
  lastSpokenAt: Date | string | null;

  // SRS / Status
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
  dbPos?: string | null,
  dbWordType?: string | null
): LexicalCategory {
  const w = word.toLowerCase().trim();

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
    "voisin",
    "voisine",
    "le voisin",
    "la voisine",
    "la serveuse",
    "locataire",
    "señor",
    "señora",
    "señorita",
    "hombre",
    "mujer",
  ]);
  if (people.has(w)) return "NOUN_PEOPLE";

  if (dbPos && dbPos !== "OTHER") {
    const upper = dbPos.toUpperCase();
    if (upper.includes("GREET") || upper.includes("INTERJ")) return "GREETING";
    if (upper.includes("PRON") || upper.includes("DET")) return "PRONOUN";
    if (upper.includes("VERB") || upper.includes("AUX")) return "VERB";
    if (upper.includes("PHRASE") || upper.includes("EXPR")) return "EXPRESSION";
    if (
      upper.includes("NOUN") ||
      upper.includes("ADJ") ||
      upper.includes("ADV") ||
      upper.includes("PREP") ||
      upper.includes("CONJ")
    ) {
      return dbWordType === "PHRASE" && w.split(/\s+/).length > 2
        ? "EXPRESSION"
        : "VOCABULARY";
    }
  }

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
    "excuses-moi",
    "excusez-moi",
    "bienvenue",
    "à bientôt",
    "bonne journée",
    "bonne nuit",
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
    "tes",
  ]);
  if (pronouns.has(w)) return "PRONOUN";

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
    "sers",
    "combine",
  ]);
  if (
    verbs.has(w) ||
    (tokens.length === 2 && pronouns.has(tokens[0]) && verbs.has(tokens[1]))
  ) {
    return "VERB";
  }

  if (dbWordType === "PHRASE" || tokens.length > 1 || w.includes("'")) {
    return "EXPRESSION";
  }

  return "VOCABULARY";
}