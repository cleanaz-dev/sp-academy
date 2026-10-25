// components/matrix/matrix-client.tsx
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { usePronunciation } from "@/context/pronunciation-context";
import { useMatrix } from "@/context/matrix-context";
import { useSpeak } from "@/hooks/use-speak";

import {
  CATEGORY_META,
  classifyWord,
  EnrichedWordStat,
  LanguageProfile,
  MatrixData,
  SessionScore,
  SortByOption,
  StructuralType,
  ViewMode,
  WordStat,
} from "./matrix-types";
import { MatrixHeroHeader } from "./matrix-hero-header";
import { MatrixFilterBar } from "./matrix-filter-bar";
import { MatrixWordCard } from "./matrix-word-card";
import { MatrixFamiliesView } from "./matrix-families-view";
import { MatrixDojoModal } from "./matrix-dojo-modal";

export * from "./matrix-types";

interface MatrixClientProps {
  matrix: MatrixData | null;
  userId?: string;
}

export default function MatrixClient({ matrix, userId }: MatrixClientProps) {
  const profiles = matrix?.languageProfiles || [];

  const [selectedLang, setSelectedLang] = useState<string>(
    profiles[0]?.languageCode || "fr-FR"
  );
  const [localProfiles, setLocalProfiles] =
    useState<LanguageProfile[]>(profiles);

  useEffect(() => {
    setLocalProfiles(matrix?.languageProfiles || []);
  }, [matrix]);

  const [viewMode, setViewMode] = useState<ViewMode>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortByOption>("recent");

  const [activeMicWordId, setActiveMicWordId] = useState<string | null>(null);
  const [activeTtsKey, setActiveTtsKey] = useState<string | null>(null);
  const [sessionScores, setSessionScores] = useState<
    Record<string, SessionScore>
  >({});

  const [isDojoOpen, setIsDojoOpen] = useState(false);
  const [dojoQueue, setDojoQueue] = useState<EnrichedWordStat[]>([]);
  const [dojoIndex, setDojoIndex] = useState(0);

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

  const currentProfile = useMemo(
    () => localProfiles.find((p) => p.languageCode === selectedLang),
    [localProfiles, selectedLang]
  );

  const enrichedWords = useMemo<EnrichedWordStat[]>(() => {
    const rawList = currentProfile?.wordStats || [];

    const baseItems = rawList.map((item) => {
      const cleanWord = item.word.trim();
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

    const standalonePhrases = enrichedWords.filter(
      (w) => w.structuralType === "PHRASE" && !coveredIds.has(w.id)
    );

    return { groups, standalonePhrases };
  }, [enrichedWords]);

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

  const startDojo = (customQueue: EnrichedWordStat[]) => {
    if (customQueue.length === 0) return;
    setDojoQueue(customQueue);
    setDojoIndex(0);
    setIsDojoOpen(true);
  };

  const activeDojoWord = useMemo(() => {
    const target = dojoQueue[dojoIndex];
    if (!target) return null;
    return enrichedWords.find((w) => w.id === target.id) || target;
  }, [dojoQueue, dojoIndex, enrichedWords]);

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

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-100 pb-24">
      <MatrixHeroHeader
        localProfiles={localProfiles}
        selectedLang={selectedLang}
        onSelectLang={(lang) => {
          if (status !== "idle") cancelAssessment();
          setSelectedLang(lang);
        }}
        statsSummary={statsSummary}
      />

      <main className="mx-auto max-w-7xl px-6 pt-8 lg:px-8">
        <MatrixFilterBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          statsSummary={statsSummary}
          familiesCount={wordFamilies.groups.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />

        {viewMode === "FAMILIES" ? (
          <MatrixFamiliesView
            groups={wordFamilies.groups}
            onListen={handleListen}
            onPronunciationTest={handlePronunciationTest}
          />
        ) : filteredWords.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No words or phrases match your current filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWords.map((wordStat) => (
              <MatrixWordCard
                key={wordStat.id}
                wordStat={wordStat}
                activeMicWordId={activeMicWordId}
                status={status}
                error={error}
                activeTtsKey={activeTtsKey}
                isTtsPlaying={isTtsPlaying}
                isTtsLoading={isTtsLoading}
                sessionResult={sessionScores[wordStat.id]}
                onListen={handleListen}
                onPronunciationTest={handlePronunciationTest}
                onSelectRelatedWord={(relId) => {
                  const found = enrichedWords.find((e) => e.id === relId);
                  if (found) startDojo([found]);
                }}
              />
            ))}
          </div>
        )}
      </main>

      <MatrixDojoModal
        isOpen={isDojoOpen}
        activeDojoWord={activeDojoWord}
        dojoIndex={dojoIndex}
        dojoQueueLength={dojoQueue.length}
        activeMicWordId={activeMicWordId}
        status={status}
        sessionResult={
          activeDojoWord ? sessionScores[activeDojoWord.id] : undefined
        }
        onClose={() => {
          if (status !== "idle") cancelAssessment();
          setIsDojoOpen(false);
        }}
        onPrev={() => {
          if (status !== "idle") cancelAssessment();
          setDojoIndex((i) => Math.max(0, i - 1));
        }}
        onNext={() => {
          if (status !== "idle") cancelAssessment();
          setDojoIndex((i) => i + 1);
        }}
        onListen={handleListen}
        onPronunciationTest={handlePronunciationTest}
      />
    </div>
  );
}