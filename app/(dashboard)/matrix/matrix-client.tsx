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
} from "lucide-react";
import { usePronunciation } from "@/context/pronunciation-context"; // Adjust path
import { useMatrix } from "@/context/matrix-context"; // Adjust path
import { useSpeak } from "@/hooks/use-speak"; // Adjust path
import { LANGUAGES } from "@/context/speech-context"; // Adjust path

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
}

export interface LanguageProfile {
  languageCode: string;
  wordStats: WordStat[];
}

export interface MatrixData {
  languageProfiles: LanguageProfile[];
}

interface MatrixClientProps {
  matrix: MatrixData | null; // 🟢 Allow null from Prisma
  userId?: string;
}
export interface LanguageProfile {
  languageCode: string;
  wordStats: WordStat[];
}

export default function MatrixClient({ matrix, userId }: MatrixClientProps) {
  const profiles = matrix?.languageProfiles || [];

  // 1. Active Language Tab State
  const [selectedLang, setSelectedLang] = useState<string>(
    profiles[0]?.languageCode || "fr-FR"
  );

  // 2. Local optimistic copy of word stats so UI updates immediately after practice
  const [localProfiles, setLocalProfiles] = useState<LanguageProfile[]>(profiles);

  useEffect(() => {
    setLocalProfiles(matrix?.languageProfiles || []);
  }, [matrix]);

  // 3. Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"recent" | "mastery" | "alpha" | "score">("recent");

  // 4. Active Word Audio / Mic Tracking
  const [activeMicWordId, setActiveMicWordId] = useState<string | null>(null);
  const [activeTtsWordId, setActiveTtsWordId] = useState<string | null>(null);
  // Store latest detailed breakdown per word ID during this session
  const [sessionScores, setSessionScores] = useState<Record<string, any>>({});

  // Contexts & Hooks
  const { status, score, error, assessSpeech, stopRecording, cancelAssessment } =
    usePronunciation();
  const { trackInteraction, syncCart } = useMatrix();
  const { speak, stop: stopTts, isPlaying: isTtsPlaying, isLoading: isTtsLoading } = useSpeak();

  // Current Language Profile
  const currentProfile = useMemo(
    () => localProfiles.find((p) => p.languageCode === selectedLang),
    [localProfiles, selectedLang]
  );

  // Filtered & Sorted Words
  const filteredWords = useMemo(() => {
    if (!currentProfile) return [];

    return currentProfile.wordStats
      .filter((item) => {
        const matchesSearch = item.word
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim());
        const matchesStatus =
          statusFilter === "ALL" || item.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "alpha") return a.word.localeCompare(b.word);
        if (sortBy === "mastery") return b.masteryScore - a.masteryScore;
        if (sortBy === "score")
          return (b.avgSpokenScore ?? -1) - (a.avgSpokenScore ?? -1);
        // Default: recent
        return new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime();
      });
  }, [currentProfile, searchQuery, statusFilter, sortBy]);

  // Summary Metrics for Current Language
  const statsSummary = useMemo(() => {
    const words = currentProfile?.wordStats || [];
    const total = words.length;
    const practicedCount = words.filter((w) => w.spokenAttempts > 0).length;
    const masteredCount = words.filter((w) => w.status === "MASTERED" || w.masteryScore >= 80).length;

    const scoredWords = words.filter((w) => w.avgSpokenScore !== null);
    const avgPronunciation =
      scoredWords.length > 0
        ? Math.round(
            scoredWords.reduce((acc, w) => acc + (w.avgSpokenScore || 0), 0) /
              scoredWords.length
          )
        : null;

    return { total, practicedCount, masteredCount, avgPronunciation };
  }, [currentProfile]);

  // --- Handlers ---

  // Handle playing reference TTS audio
  const handleListen = async (wordStat: WordStat) => {
    if (status !== "idle") return; // Don't play TTS while recording

    if (activeTtsWordId === wordStat.id && isTtsPlaying) {
      stopTts();
      setActiveTtsWordId(null);
      return;
    }

    setActiveTtsWordId(wordStat.id);
    await speak(wordStat.word, selectedLang, 0.85);

    // Optimistic update + Track interaction
    updateLocalWordStat(wordStat.id, (prev) => ({
      ...prev,
      heardCount: prev.heardCount + 1,
    }));

    trackInteraction(wordStat.word, { heard: 1 });
    if (userId) syncCart(userId, selectedLang);
  };

  // Handle Pronunciation Practice Button
  const handlePronunciationTest = async (wordStat: WordStat) => {
    // If already listening to THIS word, clicking again stops the recording early so Azure analyzes it
    if (activeMicWordId === wordStat.id && status === "listening") {
      stopRecording();
      return;
    }

    // If busy with another word, cancel it first
    if (status !== "idle") {
      cancelAssessment();
    }

    stopTts();
    setActiveMicWordId(wordStat.id);

    // Run Azure assessment and wait for full analysis
    const result: any = await assessSpeech(wordStat.word, selectedLang);

    // Extract overall score (handles common Azure SDK score property names)
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
      // Save detailed breakdown for this session card
      setSessionScores((prev) => ({
        ...prev,
        [wordStat.id]: {
          overall: numericScore,
          accuracy: result?.accuracyScore ? Math.round(result.accuracyScore) : null,
          fluency: result?.fluencyScore ? Math.round(result.fluencyScore) : null,
          completeness: result?.completenessScore
            ? Math.round(result.completenessScore)
            : null,
        },
      }));

      // Optimistically update the word card's attempts and average score
      updateLocalWordStat(wordStat.id, (prev) => {
        const newAttempts = prev.spokenAttempts + 1;
        const prevAvg = prev.avgSpokenScore ?? numericScore;
        const newAvg =
          prev.spokenAttempts === 0
            ? numericScore
            : Math.round((prevAvg * prev.spokenAttempts + numericScore) / newAttempts);

        return {
          ...prev,
          spokenAttempts: newAttempts,
          avgSpokenScore: newAvg,
          lastSpokenAt: new Date().toISOString(),
        };
      });

      // Track and sync to DB via MatrixContext
      trackInteraction(wordStat.word, {
        spokenAttempt: true,
        spokenScore: numericScore,
      });
      if (userId) {
        await syncCart(userId, selectedLang);
      }
    }
  };

  // Helper to optimistically update local state
  const updateLocalWordStat = (
    wordId: string,
    updater: (prev: WordStat) => WordStat
  ) => {
    setLocalProfiles((prevProfiles) =>
      prevProfiles.map((prof) => {
        if (prof.languageCode !== selectedLang) return prof;
        return {
          ...prof,
          wordStats: prof.wordStats.map((w) => (w.id === wordId ? updater(w) : w)),
        };
      })
    );
  };

  // Sync score fallback if `assessSpeech` wasn't modified to return `result` directly
  useEffect(() => {
    if (status === "idle" && score && activeMicWordId) {
      const s: any = score;
      const numericScore = Math.round(
        typeof s === "number"
          ? s
          : s.pronunciationScore ?? s.accuracyScore ?? s.overallScore ?? 0
      );

      if (!sessionScores[activeMicWordId]) {
        setSessionScores((prev) => ({
          ...prev,
          [activeMicWordId]: {
            overall: numericScore,
            accuracy: s?.accuracyScore ? Math.round(s.accuracyScore) : null,
            fluency: s?.fluencyScore ? Math.round(s.fluencyScore) : null,
          },
        }));
      }
    }
  }, [status, score, activeMicWordId, sessionScores]);

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
          Start completing lessons to discover new vocabulary. Every word you see,
          hear, or speak will appear here for pronunciation practice!
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Top Hero / Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold tracking-wide uppercase mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Vocabulary & Speech Lab
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Word Matrix
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
                Master your vocabulary and perfect your accent with real-time AI speech analysis.
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

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Discovered
                </p>
                <p className="text-2xl font-bold">{statsSummary.total} Words</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Spoken Practice
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
                  Avg Pronunciation
                </p>
                <p className="text-2xl font-bold">
                  {statsSummary.avgPronunciation !== null
                    ? `${statsSummary.avgPronunciation}%`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Mastered
                </p>
                <p className="text-2xl font-bold">{statsSummary.masteredCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Controls: Search, Filter, Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words or phrases..."
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Pills */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-medium">
              {["ALL", "NEW", "LEARNING", "MASTERED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    statusFilter === st
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-medium">
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

        {/* Word Grid */}
        {filteredWords.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              No words match your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredWords.map((wordStat) => {
              const isThisCardActive = activeMicWordId === wordStat.id;
              const isListening = isThisCardActive && status === "listening";
              const isAnalyzing = isThisCardActive && status === "analyzing";
              const isOtherCardBusy =
                status !== "idle" && activeMicWordId !== wordStat.id;

              const isThisTtsPlaying =
                activeTtsWordId === wordStat.id && (isTtsPlaying || isTtsLoading);

              const sessionResult = sessionScores[wordStat.id];
              const displayScore =
                sessionResult?.overall ?? wordStat.avgSpokenScore;

              // Score Badge Color Logic
              const getScoreColor = (val: number | null) => {
                if (val === null)
                  return "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400";
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
                  {/* Top Section: Status Badge + Exposure Stats */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                          wordStat.status === "MASTERED"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : wordStat.status === "NEW"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {wordStat.status}
                      </span>

                      <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
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

                    {/* Word Title + Listen Button */}
                    <div className="flex items-start justify-between gap-3 my-2">
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                          {wordStat.word}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Mastery Score: {wordStat.masteryScore} pts
                        </p>
                      </div>

                      <button
                        onClick={() => handleListen(wordStat)}
                        disabled={status !== "idle"}
                        title="Listen to pronunciation"
                        className={`p-3 rounded-xl border transition-all shrink-0 ${
                          isThisTtsPlaying
                            ? "bg-indigo-600 text-white border-indigo-600 animate-pulse"
                            : "bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
                        } disabled:opacity-40`}
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Middle Section: Pronunciation Score & Live Feedback Area */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    {/* Score Summary Row */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Pronunciation Score
                      </span>
                      <div
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${getScoreColor(
                          displayScore
                        )}`}
                      >
                        {displayScore !== null ? `${displayScore}%` : "Not Tested"}
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

                    {/* Session Sub-scores (If just tested in this session) */}
                    {sessionResult && status === "idle" && (
                      <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-center justify-around text-center">
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

                    {/* Error Message if Assessment Failed on this card */}
                    {isThisCardActive && error && status === "idle" && (
                      <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-2">{error}</span>
                      </div>
                    )}

                    {/* Action Button: Idle / Listening / Analyzing */}
                    <button
                      onClick={() => handlePronunciationTest(wordStat)}
                      disabled={isAnalyzing || isOtherCardBusy}
                      className={`w-full py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all ${
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
                          <span>Listening... Speak "{wordStat.word}"</span>
                        </>
                      ) : isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analyzing Pronunciation...</span>
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
      </div>
    </div>
  );
}