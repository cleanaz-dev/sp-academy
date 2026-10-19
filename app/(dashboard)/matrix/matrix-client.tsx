"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Volume2,
  Mic,
  Square,
  Loader2,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Eye,
  Ear,
  Award,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  MessageSquareQuote,
  Blocks,
  GitBranch,
  Play,
  X,
  ChevronRight,
  ChevronLeft,
  Flame,
  Turtle,
  ArrowUpRight,
} from "lucide-react";
import { usePronunciation } from "@/context/pronunciation-context"; // Adjust path if needed
import { useMatrix } from "@/context/matrix-context"; // Adjust path if needed
import { useSpeak } from "@/hooks/use-speak"; // Adjust path if needed
import { LANGUAGES } from "@/context/speech-context"; // Adjust path if needed

// --- Types ---
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
  // Optional future AWS fields (supported automatically when you add them later)
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

interface MatrixClientProps {
  matrix: MatrixData | null;
  userId?: string;
}

// --- Client-Side Linguistic Intelligence Engine ---
type StructuralType = "WORD" | "PHRASE";
type LexicalCategory =
  | "GREETING"
  | "PRONOUN"
  | "VERB"
  | "NOUN_PEOPLE"
  | "EXPRESSION"
  | "VOCABULARY";

interface EnrichedWordStat extends WordStat {
  cleanWord: string;
  tokens: string[];
  structuralType: StructuralType;
  category: LexicalCategory;
  categoryLabel: string;
  relatedPhrases: WordStat[]; // If single word -> phrases containing this word
  componentWords: WordStat[]; // If phrase -> single words in the matrix that make up this phrase
}

const CATEGORY_META: Record<
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

function classifyWord(word: string, dbPos?: string | null): LexicalCategory {
  if (dbPos) {
    const upper = dbPos.toUpperCase();
    if (upper.includes("PRON")) return "PRONOUN";
    if (upper.includes("VERB")) return "VERB";
    if (upper.includes("GREET")) return "GREETING";
    if (upper.includes("PHRASE") || upper.includes("EXPR")) return "EXPRESSION";
  }

  const w = word.toLowerCase().trim();
  const tokens = w.split(/\s+/);

  // 1. Common Greetings & Politeness (FR / ES / EN)
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

  // 2. Pronouns (FR / ES / EN)
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

  // 3. People & Titles
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

  // 4. Multi-word Verb Chunks or Single Verbs
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

  // 5. Multi-word Expressions vs Single Word
  if (tokens.length > 1 || w.includes("'")) {
    return "EXPRESSION";
  }

  return "VOCABULARY";
}

export default function MatrixClient({ matrix, userId }: MatrixClientProps) {
  const profiles = matrix?.languageProfiles || [];

  // 1. Active Language Tab
  const [selectedLang, setSelectedLang] = useState<string>(
    profiles[0]?.languageCode || "fr-FR"
  );

  // 2. Local optimistic copy of profiles
  const [localProfiles, setLocalProfiles] =
    useState<LanguageProfile[]>(profiles);

  useEffect(() => {
    setLocalProfiles(matrix?.languageProfiles || []);
  }, [matrix]);

  // 3. View & Filter States
  const [viewMode, setViewMode] = useState<
    "ALL" | "WORDS" | "PHRASES" | "FAMILIES"
  >("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<
    "recent" | "mastery" | "alpha" | "score"
  >("recent");

  // 4. Audio & Pronunciation Tracking
  const [activeMicWordId, setActiveMicWordId] = useState<string | null>(null);
  const [activeTtsKey, setActiveTtsKey] = useState<string | null>(null);
  const [sessionScores, setSessionScores] = useState<Record<string, any>>({});

  // 5. Guided "Voice Dojo" Modal State
  const [isDojoOpen, setIsDojoOpen] = useState(false);
  const [dojoQueue, setDojoQueue] = useState<EnrichedWordStat[]>([]);
  const [dojoIndex, setDojoIndex] = useState(0);

  // Contexts
  const {
    status,
    score,
    error,
    assessSpeech,
    stopRecording,
    cancelAssessment,
  } = usePronunciation();
  const { trackInteraction, syncCart } = useMatrix();
  const {
    speak,
    stop: stopTts,
    isPlaying: isTtsPlaying,
    isLoading: isTtsLoading,
  } = useSpeak();

  // Current Profile
  const currentProfile = useMemo(
    () => localProfiles.find((p) => p.languageCode === selectedLang),
    [localProfiles, selectedLang]
  );

  // --- Enrich Words with Structural & Family Relationships ---
  const enrichedWords = useMemo<EnrichedWordStat[]>(() => {
    const rawList = currentProfile?.wordStats || [];

    // Pre-tokenize everything
    const baseItems = rawList.map((item) => {
      const cleanWord = item.word.trim();
      // Split by space or apostrophe to detect multi-part chunks like "je suis" or "j'aime"
      const tokens = cleanWord
        .toLowerCase()
        .split(/[\s']+/)
        .filter(Boolean);
      const structuralType: StructuralType =
        cleanWord.includes(" ") || cleanWord.includes("'") ? "PHRASE" : "WORD";
      const category = classifyWord(cleanWord, item.partOfSpeech);

      return {
        ...item,
        cleanWord,
        tokens,
        structuralType,
        category,
        categoryLabel: CATEGORY_META[category].label,
      };
    });

    // Cross-link Single Words <-> Phrases ("je" <-> "je suis")
    return baseItems.map((item) => {
      if (item.structuralType === "WORD") {
        const lowerWord = item.cleanWord.toLowerCase();
        const relatedPhrases = baseItems.filter(
          (other) =>
            other.id !== item.id &&
            other.structuralType === "PHRASE" &&
            other.tokens.includes(lowerWord)
        );
        return { ...item, relatedPhrases, componentWords: [] };
      } else {
        const componentWords = baseItems.filter(
          (other) =>
            other.id !== item.id &&
            other.structuralType === "WORD" &&
            item.tokens.includes(other.cleanWord.toLowerCase())
        );
        return { ...item, relatedPhrases: [], componentWords };
      }
    });
  }, [currentProfile]);

  // --- Priority Practice Queue (Needs Voice Practice) ---
  const priorityQueue = useMemo(() => {
    return [...enrichedWords]
      .filter((w) => w.spokenAttempts === 0 || (w.avgSpokenScore ?? 0) < 80)
      .sort((a, b) => {
        // Untested first, then lowest score
        if (a.spokenAttempts === 0 && b.spokenAttempts > 0) return -1;
        if (b.spokenAttempts === 0 && a.spokenAttempts > 0) return 1;
        return (a.avgSpokenScore ?? 0) - (b.avgSpokenScore ?? 0);
      })
      .slice(0, 5);
  }, [enrichedWords]);

  // --- Word Families Grouping (Root Word + Its Phrases) ---
  const wordFamilies = useMemo(() => {
    const roots = enrichedWords.filter(
      (w) => w.structuralType === "WORD" && w.relatedPhrases.length > 0
    );
    const coveredIds = new Set<string>();
    const groups = roots.map((root) => {
      coveredIds.add(root.id);
      root.relatedPhrases.forEach((p) => coveredIds.add(p.id));
      return {
        root,
        phrases: enrichedWords.filter((e) =>
          root.relatedPhrases.some((rp) => rp.id === e.id)
        ),
      };
    });

    // Standalone phrases not linked to a single root word yet
    const standalonePhrases = enrichedWords.filter(
      (w) => w.structuralType === "PHRASE" && !coveredIds.has(w.id)
    );

    return { groups, standalonePhrases };
  }, [enrichedWords]);

  // --- Filtered & Sorted Words for Grid ---
  const filteredWords = useMemo(() => {
    return enrichedWords
      .filter((item) => {
        if (viewMode === "WORDS" && item.structuralType !== "WORD")
          return false;
        if (viewMode === "PHRASES" && item.structuralType !== "PHRASE")
          return false;
        if (categoryFilter !== "ALL" && item.category !== categoryFilter)
          return false;
        if (statusFilter !== "ALL" && item.status !== statusFilter)
          return false;

        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase().trim();
          return item.cleanWord.toLowerCase().includes(q);
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "alpha") return a.cleanWord.localeCompare(b.cleanWord);
        if (sortBy === "mastery") return b.masteryScore - a.masteryScore;
        if (sortBy === "score")
          return (b.avgSpokenScore ?? -1) - (a.avgSpokenScore ?? -1);
        return (
          new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
        );
      });
  }, [
    enrichedWords,
    viewMode,
    categoryFilter,
    statusFilter,
    searchQuery,
    sortBy,
  ]);

  // --- KPI Stats ---
  const statsSummary = useMemo(() => {
    const total = enrichedWords.length;
    const singleWordsCount = enrichedWords.filter(
      (w) => w.structuralType === "WORD"
    ).length;
    const phrasesCount = enrichedWords.filter(
      (w) => w.structuralType === "PHRASE"
    ).length;
    const practicedCount = enrichedWords.filter(
      (w) => w.spokenAttempts > 0
    ).length;
    const scoredWords = enrichedWords.filter((w) => w.avgSpokenScore !== null);
    const avgPronunciation =
      scoredWords.length > 0
        ? Math.round(
            scoredWords.reduce((acc, w) => acc + (w.avgSpokenScore || 0), 0) /
              scoredWords.length
          )
        : null;

    return {
      total,
      singleWordsCount,
      phrasesCount,
      practicedCount,
      avgPronunciation,
    };
  }, [enrichedWords]);

  // --- Handlers ---
  const updateLocalWordStat = (
    wordId: string,
    updater: (prev: WordStat) => WordStat
  ) => {
    setLocalProfiles((prevProfiles) =>
      prevProfiles.map((prof) => {
        if (prof.languageCode !== selectedLang) return prof;
        return {
          ...prof,
          wordStats: prof.wordStats.map((w) =>
            w.id === wordId ? updater(w) : w
          ),
        };
      })
    );
  };

  const handleListen = async (wordStat: WordStat, speed: number = 0.9) => {
    if (status !== "idle") return;

    const ttsKey = `${wordStat.id}-${speed}`;
    if (activeTtsKey === ttsKey && isTtsPlaying) {
      stopTts();
      setActiveTtsKey(null);
      return;
    }

    setActiveTtsKey(ttsKey);
    await speak(wordStat.word, selectedLang, speed);

    updateLocalWordStat(wordStat.id, (prev) => ({
      ...prev,
      heardCount: prev.heardCount + 1,
    }));

    trackInteraction(wordStat.word, { heard: 1 });
    if (userId) syncCart(userId, selectedLang);
  };

  const handlePronunciationTest = async (wordStat: WordStat) => {
    if (activeMicWordId === wordStat.id && status === "listening") {
      stopRecording();
      return;
    }

    if (status !== "idle") {
      cancelAssessment();
    }

    stopTts();
    setActiveMicWordId(wordStat.id);

    const result: any = await assessSpeech(wordStat.word, selectedLang);

    const numericScore: number | null =
      result !== null && result !== undefined
        ? typeof result === "number"
          ? Math.round(result)
          : Math.round(
              result.pronunciationScore ??
                result.accuracyScore ??
                result.overallScore ??
                0
            )
        : null;

    if (numericScore !== null) {
      setSessionScores((prev) => ({
        ...prev,
        [wordStat.id]: {
          overall: numericScore,
          accuracy: result?.accuracyScore
            ? Math.round(result.accuracyScore)
            : null,
          fluency: result?.fluencyScore
            ? Math.round(result.fluencyScore)
            : null,
        },
      }));

      updateLocalWordStat(wordStat.id, (prev) => {
        const newAttempts = prev.spokenAttempts + 1;
        const prevAvg = prev.avgSpokenScore ?? numericScore;
        const newAvg =
          prev.spokenAttempts === 0
            ? numericScore
            : Math.round(
                (prevAvg * prev.spokenAttempts + numericScore) / newAttempts
              );

        return {
          ...prev,
          spokenAttempts: newAttempts,
          avgSpokenScore: newAvg,
          lastSpokenAt: new Date().toISOString(),
        };
      });

      trackInteraction(wordStat.word, {
        spokenAttempt: true,
        spokenScore: numericScore,
      });
      if (userId) {
        await syncCart(userId, selectedLang);
      }
    }
  };

  // Fallback sync if `assessSpeech` doesn't return `result` directly
  useEffect(() => {
    if (status === "idle" && score && activeMicWordId) {
      const s: any = score;
      const numericScore = Math.round(
        typeof s === "number"
          ? s
          : s.pronunciationScore ?? s.accuracyScore ?? s.overallScore ?? 0
      );

      setSessionScores((prev) => ({
        ...prev,
        [activeMicWordId]: {
          overall: numericScore,
          accuracy: s?.accuracyScore ? Math.round(s.accuracyScore) : null,
          fluency: s?.fluencyScore ? Math.round(s.fluencyScore) : null,
        },
      }));
    }
  }, [status, score, activeMicWordId]);

  // Launch Guided Dojo
  const startDojo = (customQueue?: EnrichedWordStat[]) => {
    const queueToUse =
      customQueue && customQueue.length > 0
        ? customQueue
        : priorityQueue.length > 0
        ? priorityQueue
        : enrichedWords.slice(0, 5);

    if (queueToUse.length === 0) return;
    setDojoQueue(queueToUse);
    setDojoIndex(0);
    setIsDojoOpen(true);
  };

  if (!profiles.length) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Your Word Matrix is Empty
        </h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2">
          Complete lessons to unlock words and phrases. Every word you encounter
          will be organized here for pronunciation mastery.
        </p>
      </div>
    );
  }

  // Active word in Dojo modal (synced with latest local state)
  const activeDojoWord = useMemo(() => {
    const target = dojoQueue[dojoIndex];
    if (!target) return null;
    return enrichedWords.find((w) => w.id === target.id) || target;
  }, [dojoQueue, dojoIndex, enrichedWords]);

  return (
    <div className="min-h-screen animate-bg dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">
      {/* ================= HERO HEADER ================= */}
      <div className=" border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Interactive Speech & Vocabulary Studio
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Language Matrix
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
                Master core building-block words and connected phrases with live
                pronunciation analysis.
              </p>
            </div>

            {/* Language Selector Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/70 p-1.5 rounded-2xl self-start">
              {localProfiles.map((profile) => {
                const isSelected = profile.languageCode === selectedLang;
                const label =
                  LANGUAGES[profile.languageCode] || profile.languageCode;
                return (
                  <button
                    key={profile.languageCode}
                    onClick={() => {
                      if (status !== "idle") cancelAssessment();
                      setSelectedLang(profile.languageCode);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isSelected
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {profile.wordStats.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= GUIDED DOJO BANNER ================= */}
          <div className="mt-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white p-6 sm:p-8 shadow-xl">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold mb-3 backdrop-blur-sm">
                  <Flame className="w-4 h-4 text-amber-300 fill-amber-300" />
                  Daily Pronunciation Dojo
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold">
                  {priorityQueue.length > 0
                    ? `${priorityQueue.length} items ready for voice practice`
                    : "All caught up! Keep sharpening your accent"}
                </h2>
                <p className="text-indigo-100 text-sm sm:text-base mt-2">
                  Practice isolated building blocks first (like{" "}
                  <span className="font-semibold underline decoration-indigo-300">
                    single words
                  </span>
                  ), then master fluid liaisons in{" "}
                  <span className="font-semibold underline decoration-indigo-300">
                    connected phrases
                  </span>
                  .
                </p>

                {/* Preview Chips of Priority Words */}
                {priorityQueue.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="text-xs text-indigo-200 font-medium mr-1">
                      Up next:
                    </span>
                    {priorityQueue.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => startDojo([item, ...priorityQueue.filter((x) => x.id !== item.id)])}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-sm transition"
                      >
                        <span>{item.cleanWord}</span>
                        <span className="text-[10px] opacity-75">
                          {item.avgSpokenScore !== null
                            ? `${item.avgSpokenScore}%`
                            : "New"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <button
                  onClick={() => startDojo()}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-lg transition transform hover:-translate-y-0.5"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start {Math.min(5, enrichedWords.length)}-Word Voice Drill
                </button>
              </div>
            </div>
          </div>

          {/* ================= KPI SUMMARY STRIP ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Blocks className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Core Words
                </p>
                <p className="text-2xl font-bold">
                  {statsSummary.singleWordsCount}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <MessageSquareQuote className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Phrases & Chunks
                </p>
                <p className="text-2xl font-bold">{statsSummary.phrasesCount}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Voice Tested
                </p>
                <p className="text-2xl font-bold">
                  {statsSummary.practicedCount}{" "}
                  <span className="text-sm font-normal text-slate-400">
                    / {statsSummary.total}
                  </span>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Avg Accent Score
                </p>
                <p className="text-2xl font-bold">
                  {statsSummary.avgPronunciation !== null
                    ? `${statsSummary.avgPronunciation}%`
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN NAVIGATION & CONTENT ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Structural View Mode Tabs (Separates Single Words, Phrases, and Word Families) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setViewMode("ALL")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                viewMode === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Items ({statsSummary.total})</span>
            </button>

            <button
              onClick={() => setViewMode("WORDS")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                viewMode === "WORDS"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <Blocks className="w-4 h-4" />
              <span>Single Words ({statsSummary.singleWordsCount})</span>
            </button>

            <button
              onClick={() => setViewMode("PHRASES")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                viewMode === "PHRASES"
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <MessageSquareQuote className="w-4 h-4" />
              <span>Phrases & Chunks ({statsSummary.phrasesCount})</span>
            </button>

            <button
              onClick={() => setViewMode("FAMILIES")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                viewMode === "FAMILIES"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Word Families ({wordFamilies.groups.length})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search word or phrase..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Grammatical Category Chips + Sort Bar (Hidden in Families View) */}
        {viewMode !== "FAMILIES" && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            {/* Lexical / Grammar Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {[
                { key: "ALL", label: "All Categories" },
                { key: "GREETING", label: "👋 Greetings & Social" },
                { key: "PRONOUN", label: "👤 Pronouns" },
                { key: "VERB", label: "⚡ Verbs & Actions" },
                { key: "NOUN_PEOPLE", label: "🧑 People & Titles" },
                { key: "EXPRESSION", label: "💬 Expressions" },
                { key: "VOCABULARY", label: "🧱 Core Vocab" },
              ].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    categoryFilter === cat.key
                      ? "bg-indigo-600 text-white"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Right Controls: Status & Sort */}
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-medium">
                {["ALL", "NEW", "LEARNING", "MASTERED"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      statusFilter === st
                        ? "bg-slate-900 text-white dark:bg-slate-700"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent focus:outline-none text-slate-700 dark:text-slate-200"
                >
                  <option value="recent">Recently Seen</option>
                  <option value="score">Pronunciation Score</option>
                  <option value="mastery">Mastery Level</option>
                  <option value="alpha">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 1: WORD FAMILIES TREE VIEW ================= */}
        {viewMode === "FAMILIES" ? (
          <div className="space-y-6">
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
                  🧬 How Word Families Work
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  Instead of memorizing isolated words, practice how a root
                  building block (like <strong>&ldquo;je&rdquo;</strong>) flows into
                  natural phrases (like <strong>&ldquo;je suis&rdquo;</strong>).
                </p>
              </div>
            </div>

            {wordFamilies.groups.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                <p className="text-slate-500">
                  No multi-word families linked yet. Keep learning phrases to
                  see how your single words connect!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {wordFamilies.groups.map(({ root, phrases }) => (
                  <div
                    key={root.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Left: Root Building Block */}
                      <div className="lg:w-1/3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                          🧱 Root Word
                        </span>
                        <div className="flex items-center justify-between mt-3">
                          <h4 className="text-2xl font-extrabold">
                            {root.cleanWord}
                          </h4>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleListen(root, 0.9)}
                              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:text-indigo-600"
                              title="Normal Speed"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handlePronunciationTest(root)}
                              className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5"
                            >
                              <Mic className="w-3.5 h-3.5" />
                              {root.avgSpokenScore !== null
                                ? `${root.avgSpokenScore}%`
                                : "Speak"}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Connected Phrases */}
                      <div className="flex-1 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Builds Into Phrases ({phrases.length})
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {phrases.map((phrase) => (
                            <div
                              key={phrase.id}
                              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition"
                            >
                              <div>
                                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                  💬 Connected Phrase
                                </span>
                                <p className="text-lg font-bold">
                                  {phrase.cleanWord}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleListen(phrase, 0.9)}
                                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-indigo-600"
                                  title="Listen Normal"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleListen(phrase, 0.6)}
                                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-amber-600"
                                  title="Listen Slow (0.6x)"
                                >
                                  <Turtle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() =>
                                    handlePronunciationTest(phrase)
                                  }
                                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1"
                                >
                                  <Mic className="w-3.5 h-3.5" />
                                  {phrase.avgSpokenScore !== null
                                    ? `${phrase.avgSpokenScore}%`
                                    : "Test"}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ================= VIEW 2: STANDARD INTELLIGENT CARDS GRID ================= */
          <>
            {filteredWords.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
                <p className="text-slate-500 dark:text-slate-400">
                  No words or phrases match your current filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredWords.map((wordStat) => {
                  const isThisCardActive = activeMicWordId === wordStat.id;
                  const isListening =
                    isThisCardActive && status === "listening";
                  const isAnalyzing =
                    isThisCardActive && status === "analyzing";
                  const isOtherCardBusy =
                    status !== "idle" && activeMicWordId !== wordStat.id;

                  const sessionResult = sessionScores[wordStat.id];
                  const displayScore =
                    sessionResult?.overall ?? wordStat.avgSpokenScore;

                  const getScoreColor = (val: number | null) => {
                    if (val === null)
                      return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent";
                    if (val >= 80)
                      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                    if (val >= 60)
                      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
                  };

                  return (
                    <div
                      key={wordStat.id}
                      className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 p-5 flex flex-col justify-between ${
                        isListening
                          ? "border-rose-500 ring-4 ring-rose-500/10 shadow-lg"
                          : isAnalyzing
                          ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg"
                          : "border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:shadow-md"
                      }`}
                    >
                      {/* Top Header: Category Badge + Exposure Counters */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-lg border ${
                              CATEGORY_META[wordStat.category].badgeClass
                            }`}
                          >
                            {wordStat.categoryLabel}
                          </span>

                          <div className="flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500">
                            <span
                              className="flex items-center gap-1"
                              title="Times Seen"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {wordStat.seenCount}
                            </span>
                            <span
                              className="flex items-center gap-1"
                              title="Times Heard"
                            >
                              <Ear className="w-3.5 h-3.5" />
                              {wordStat.heardCount}
                            </span>
                            <span
                              className="flex items-center gap-1"
                              title="Spoken Attempts"
                            >
                              <Mic className="w-3.5 h-3.5" />
                              {wordStat.spokenAttempts}
                            </span>
                          </div>
                        </div>

                        {/* Word Title + Normal & Slow (Turtle) Audio Buttons */}
                        <div className="flex items-start justify-between gap-3 my-2">
                          <div>
                            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                              {wordStat.cleanWord}
                            </h3>
                            {wordStat.translation ? (
                              <p className="text-xs font-medium text-slate-500 mt-0.5">
                                {wordStat.translation}
                              </p>
                            ) : (
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                {wordStat.structuralType === "PHRASE"
                                  ? `${wordStat.tokens.length}-word expression`
                                  : "Single building-block word"}
                              </p>
                            )}
                          </div>

                          {/* Audio Controls: Normal (0.9x) + Slow (0.6x) */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleListen(wordStat, 0.9)}
                              disabled={status !== "idle"}
                              title="Listen (Normal Speed)"
                              className={`p-2.5 rounded-xl border transition-all ${
                                activeTtsKey === `${wordStat.id}-0.9` &&
                                (isTtsPlaying || isTtsLoading)
                                  ? "bg-indigo-600 text-white border-indigo-600 animate-pulse"
                                  : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600"
                              } disabled:opacity-40`}
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleListen(wordStat, 0.6)}
                              disabled={status !== "idle"}
                              title="Listen Slow (0.6x Turtle Speed)"
                              className={`p-2.5 rounded-xl border transition-all ${
                                activeTtsKey === `${wordStat.id}-0.6` &&
                                (isTtsPlaying || isTtsLoading)
                                  ? "bg-amber-500 text-white border-amber-500 animate-pulse"
                                  : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600"
                              } disabled:opacity-40`}
                            >
                              <Turtle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Smart Family Chips: Shows how "je" links to "je suis" */}
                        {wordStat.relatedPhrases.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                              Used in phrases:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {wordStat.relatedPhrases.map((rel) => (
                                <button
                                  key={rel.id}
                                  onClick={() => {
                                    const enrichedRel = enrichedWords.find(
                                      (e) => e.id === rel.id
                                    );
                                    if (enrichedRel) startDojo([enrichedRel]);
                                  }}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition"
                                >
                                  <span>{rel.word}</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {wordStat.componentWords.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                              Built from core word:
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {wordStat.componentWords.map((comp) => (
                                <button
                                  key={comp.id}
                                  onClick={() => {
                                    const enrichedComp = enrichedWords.find(
                                      (e) => e.id === comp.id
                                    );
                                    if (enrichedComp) startDojo([enrichedComp]);
                                  }}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition"
                                >
                                  <span>🧱 {comp.word}</span>
                                  <ArrowUpRight className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Section: Pronunciation Score & Practice Button */}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Pronunciation Accuracy
                          </span>
                          <div
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${getScoreColor(
                              displayScore
                            )}`}
                          >
                            {displayScore !== null
                              ? `${displayScore}%`
                              : "Untested"}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                          <div
                            className={`h-full transition-all duration-500 rounded-full ${
                              displayScore === null
                                ? "w-0"
                                : displayScore >= 80
                                ? "bg-emerald-500"
                                : displayScore >= 60
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${displayScore ?? 0}%` }}
                          />
                        </div>

                        {/* Session Sub-scores */}
                        {sessionResult && status === "idle" && (
                          <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-around text-center">
                            <div>
                              <p className="text-[10px] uppercase text-slate-400 font-semibold">
                                Latest
                              </p>
                              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                {sessionResult.overall}%
                              </p>
                            </div>
                            {sessionResult.accuracy !== null && (
                              <div>
                                <p className="text-[10px] uppercase text-slate-400 font-semibold">
                                  Accuracy
                                </p>
                                <p className="text-sm font-bold">
                                  {sessionResult.accuracy}%
                                </p>
                              </div>
                            )}
                            {sessionResult.fluency !== null && (
                              <div>
                                <p className="text-[10px] uppercase text-slate-400 font-semibold">
                                  Fluency
                                </p>
                                <p className="text-sm font-bold">
                                  {sessionResult.fluency}%
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Error Notice */}
                        {isThisCardActive && error && status === "idle" && (
                          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span className="line-clamp-2">{error}</span>
                          </div>
                        )}

                        {/* Action Button */}
                        <button
                          onClick={() => handlePronunciationTest(wordStat)}
                          disabled={isAnalyzing || isOtherCardBusy}
                          className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                            isListening
                              ? "bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/25 animate-pulse"
                              : isAnalyzing
                              ? "bg-indigo-600 text-white cursor-wait opacity-90"
                              : "bg-slate-900 hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 text-white"
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {isListening ? (
                            <>
                              <Square className="w-4 h-4 fill-current" />
                              <span>Speak &ldquo;{wordStat.cleanWord}&rdquo;...</span>
                            </>
                          ) : isAnalyzing ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Analyzing Voice...</span>
                            </>
                          ) : wordStat.spokenAttempts > 0 ? (
                            <>
                              <RefreshCw className="w-4 h-4" />
                              <span>Practice Again</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-4 h-4" />
                              <span>Test Pronunciation</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ================= INTERACTIVE VOICE DOJO MODAL ================= */}
      {isDojoOpen && activeDojoWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header & Progress */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  Word {dojoIndex + 1} of {dojoQueue.length}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    CATEGORY_META[activeDojoWord.category].badgeClass
                  }`}
                >
                  {activeDojoWord.categoryLabel}
                </span>
              </div>

              <button
                onClick={() => {
                  if (status !== "idle") cancelAssessment();
                  setIsDojoOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{
                  width: `${((dojoIndex + 1) / dojoQueue.length) * 100}%`,
                }}
              />
            </div>

            {/* Center Stage Word */}
            <div className="text-center my-6">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-2">
                {activeDojoWord.structuralType === "PHRASE"
                  ? "Connected Expression"
                  : "Core Building Block"}
              </p>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {activeDojoWord.cleanWord}
              </h2>

              {/* Listen Buttons */}
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => handleListen(activeDojoWord, 0.9)}
                  disabled={status !== "idle"}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-sm font-semibold text-slate-700 dark:text-slate-200 transition"
                >
                  <Volume2 className="w-4 h-4 text-indigo-500" />
                  Listen (1.0x)
                </button>
                <button
                  onClick={() => handleListen(activeDojoWord, 0.6)}
                  disabled={status !== "idle"}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-sm font-semibold text-slate-700 dark:text-slate-200 transition"
                >
                  <Turtle className="w-4 h-4 text-amber-500" />
                  Slow (0.6x)
                </button>
              </div>
            </div>

            {/* Score Display if Tested */}
            {(sessionScores[activeDojoWord.id] ||
              activeDojoWord.avgSpokenScore !== null) &&
              status === "idle" && (
                <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase">
                    Pronunciation Score
                  </p>
                  <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                    {sessionScores[activeDojoWord.id]?.overall ??
                      activeDojoWord.avgSpokenScore}
                    %
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {(sessionScores[activeDojoWord.id]?.overall ??
                      activeDojoWord.avgSpokenScore ??
                      0) >= 80
                      ? "🎉 Excellent pronunciation! Ready for the next word."
                      : "💡 Tip: Try listening at 0.6x Slow speed and speak again!"}
                  </p>
                </div>
              )}

            {/* Big Microphone Button */}
            <button
              onClick={() => handlePronunciationTest(activeDojoWord)}
              disabled={status === "analyzing"}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg ${
                activeMicWordId === activeDojoWord.id && status === "listening"
                  ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
                  : activeMicWordId === activeDojoWord.id &&
                    status === "analyzing"
                  ? "bg-indigo-600 text-white cursor-wait"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {activeMicWordId === activeDojoWord.id &&
              status === "listening" ? (
                <>
                  <Square className="w-5 h-5 fill-current" />
                  <span>Listening... Tap to Stop</span>
                </>
              ) : activeMicWordId === activeDojoWord.id &&
                status === "analyzing" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Your Accent...</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Tap & Speak &ldquo;{activeDojoWord.cleanWord}&rdquo;</span>
                </>
              )}
            </button>

            {/* Footer Navigation (Previous / Next Word) */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  if (status !== "idle") cancelAssessment();
                  setDojoIndex((i) => Math.max(0, i - 1));
                }}
                disabled={dojoIndex === 0 || status !== "idle"}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {dojoIndex < dojoQueue.length - 1 ? (
                <button
                  onClick={() => {
                    if (status !== "idle") cancelAssessment();
                    setDojoIndex((i) => i + 1);
                  }}
                  disabled={status !== "idle"}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold"
                >
                  Next Word
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (status !== "idle") cancelAssessment();
                    setIsDojoOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Finish Drill
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}