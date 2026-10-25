// components/matrix/matrix-word-card.tsx
"use client";

import React, { useState } from "react";
import {
  Eye,
  Ear,
  Mic,
  MousePointerClick,
  Volume2,
  Turtle,
  ArrowUpRight,
  AlertCircle,
  Square,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  GitCommitHorizontal,
} from "lucide-react";
import { EnrichedWordStat, SessionScore, WordStat } from "./matrix-types";

interface MatrixWordCardProps {
  wordStat: EnrichedWordStat;
  activeMicWordId: string | null;
  status: string;
  error: string | null;
  activeTtsKey: string | null;
  isTtsPlaying: boolean;
  isTtsLoading: boolean;
  sessionResult?: SessionScore;
  onListen: (wordStat: WordStat, speed: number) => void;
  onPronunciationTest: (wordStat: WordStat) => void;
  onSelectRelatedWord: (wordId: string) => void;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  MASTERED: {
    label: "Mastered",
    className:
      "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  },
  FAMILIAR: {
    label: "Familiar",
    className:
      "bg-cyan-500/15 text-cyan-700 border-cyan-500/30 dark:text-cyan-300",
  },
  LEARNING: {
    label: "Learning",
    className:
      "bg-indigo-500/15 text-indigo-700 border-indigo-500/30 dark:text-indigo-300",
  },
  NEW: {
    label: "New",
    className:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  },
};

export function MatrixWordCard({
  wordStat,
  activeMicWordId,
  status,
  error,
  activeTtsKey,
  isTtsPlaying,
  isTtsLoading,
  sessionResult,
  onListen,
  onPronunciationTest,
  onSelectRelatedWord,
}: MatrixWordCardProps) {
  const [showLinks, setShowLinks] = useState(false);

  const isThisCardActive = activeMicWordId === wordStat.id;
  const isListening = isThisCardActive && status === "listening";
  const isAnalyzing = isThisCardActive && status === "analyzing";
  const isOtherCardBusy =
    status !== "idle" && activeMicWordId !== wordStat.id;

  const displayScore = sessionResult?.overall ?? wordStat.avgSpokenScore;

  const isPlayingNormal =
    activeTtsKey === `${wordStat.id}-0.9` && (isTtsPlaying || isTtsLoading);
  const isPlayingSlow =
    activeTtsKey === `${wordStat.id}-0.6` && (isTtsPlaying || isTtsLoading);

  const linkedItems = [
    ...wordStat.relatedPhrases,
    ...wordStat.linkedComponentWords,
    ...wordStat.sameLemmaWords,
  ].filter(
    (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx
  );

  const statusMeta = STATUS_BADGE[wordStat.status] || STATUS_BADGE.NEW;
  const totalTaps = (wordStat.tappedCorrect || 0) + (wordStat.tappedWrong || 0);

  const showDistinctLemma =
    wordStat.lemma &&
    wordStat.lemma.toLowerCase() !== wordStat.cleanWord.toLowerCase();

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 p-4 shadow-xs ${
        isListening
          ? "border-rose-500 ring-4 ring-rose-500/15 shadow-md"
          : isAnalyzing
            ? "border-indigo-500 ring-4 ring-indigo-500/15 shadow-md"
            : "border-slate-200/90 dark:border-slate-800 hover:border-indigo-400/60 hover:shadow-md"
      }`}
    >
      {/* Row 1: Word, Gender Badge, Status Badge & Translation/Lemma */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="truncate text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {wordStat.cleanWord}
            </h3>

            {/* Grammatical Gender Badge (M / F) */}
            {wordStat.grammaticalGender === "M" && (
              <span
                title="Masculine Noun/Adjective"
                className="shrink-0 rounded-md bg-sky-500/15 border border-sky-500/30 px-1.5 py-0.5 text-[10px] font-black text-sky-700 dark:text-sky-300"
              >
                ♂ M
              </span>
            )}
            {wordStat.grammaticalGender === "F" && (
              <span
                title="Feminine Noun/Adjective"
                className="shrink-0 rounded-md bg-pink-500/15 border border-pink-500/30 px-1.5 py-0.5 text-[10px] font-black text-pink-700 dark:text-pink-300"
              >
                ♀ F
              </span>
            )}

            <span
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${statusMeta.className}`}
            >
              {statusMeta.label}
            </span>
          </div>

          {/* Translation + Root Lemma + Linked Words Toggle */}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="truncate text-xs font-bold text-slate-500 dark:text-slate-400">
              {wordStat.translation || wordStat.categoryLabel}
            </p>

            {showDistinctLemma && (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-extrabold text-violet-700 dark:text-violet-300">
                <GitCommitHorizontal className="h-3 w-3" />
                Root: {wordStat.lemma}
              </span>
            )}

            {linkedItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowLinks((prev) => !prev)}
                className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 transition"
              >
                <span>{linkedItems.length} linked</span>
                {showLinks ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Controls: Primary Play + Small Slow + Mic Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onListen(wordStat, 0.9)}
            disabled={status !== "idle"}
            title="Listen (Normal Speed)"
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-40 ${
              isPlayingNormal
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 animate-pulse"
                : "bg-indigo-500/10 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-500/20 dark:text-indigo-300"
            }`}
          >
            <Volume2 className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            onClick={() => onListen(wordStat, 0.6)}
            disabled={status !== "idle"}
            title="Listen Slow (0.6x)"
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all active:scale-95 disabled:opacity-40 ${
              isPlayingSlow
                ? "border-amber-500 bg-amber-500 text-white animate-pulse"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
            }`}
          >
            <Turtle className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onPronunciationTest(wordStat)}
            disabled={isAnalyzing || isOtherCardBusy}
            className={`ml-1 inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-extrabold transition-all active:scale-95 disabled:opacity-40 ${
              isListening
                ? "bg-rose-600 text-white shadow-md shadow-rose-500/25 animate-pulse"
                : isAnalyzing
                  ? "bg-indigo-600 text-white cursor-wait"
                  : displayScore !== null
                    ? displayScore >= 80
                      ? "bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs"
                      : displayScore >= 60
                        ? "bg-amber-500 text-white hover:bg-amber-400 shadow-xs"
                        : "bg-rose-600 text-white hover:bg-rose-500 shadow-xs"
                    : "bg-slate-900 text-white hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600"
            }`}
          >
            {isListening ? (
              <>
                <Square className="h-3 w-3 fill-current" />
                <span>Stop</span>
              </>
            ) : isAnalyzing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>...</span>
              </>
            ) : displayScore !== null ? (
              <>
                <Mic className="h-3.5 w-3.5" />
                <span>{displayScore}%</span>
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5" />
                <span>Speak</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Emphasized 4-Signal Matrix Strip (Seen • Heard • Tapped • Spoken) */}
      <div className="mt-3.5 grid grid-cols-4 gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        {/* 1. SEEN */}
        <div
          className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-extrabold transition ${
            wordStat.seenCount > 0
              ? "bg-sky-500/10 text-sky-700 border border-sky-500/20 dark:text-sky-300"
              : "bg-slate-50 text-slate-400 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800"
          }`}
          title="Times Seen in Lessons"
        >
          <Eye className="h-3.5 w-3.5 shrink-0" />
          <span>{wordStat.seenCount}</span>
          <span className="hidden sm:inline text-[10px] font-semibold opacity-75">
            Seen
          </span>
        </div>

        {/* 2. HEARD */}
        <div
          className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-extrabold transition ${
            wordStat.heardCount > 0
              ? "bg-indigo-500/10 text-indigo-700 border border-indigo-500/20 dark:text-indigo-300"
              : "bg-slate-50 text-slate-400 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800"
          }`}
          title="Times Audio Heard"
        >
          <Ear className="h-3.5 w-3.5 shrink-0" />
          <span>{wordStat.heardCount}</span>
          <span className="hidden sm:inline text-[10px] font-semibold opacity-75">
            Heard
          </span>
        </div>

        {/* 3. TAPPED */}
        <div
          className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-extrabold transition ${
            wordStat.tappedCorrect > 0
              ? "bg-amber-500/12 text-amber-700 border border-amber-500/25 dark:text-amber-300"
              : totalTaps > 0
                ? "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-300"
                : "bg-slate-50 text-slate-400 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800"
          }`}
          title={`Tapped Correct: ${wordStat.tappedCorrect} | Tapped Wrong: ${wordStat.tappedWrong}`}
        >
          <MousePointerClick className="h-3.5 w-3.5 shrink-0" />
          <span>
            {wordStat.tappedCorrect}
            {wordStat.tappedWrong > 0 ? `/${totalTaps}` : ""}
          </span>
          <span className="hidden sm:inline text-[10px] font-semibold opacity-75">
            Tap
          </span>
        </div>

        {/* 4. SPOKEN */}
        <div
          className={`flex items-center justify-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-extrabold transition ${
            wordStat.spokenAttempts > 0
              ? "bg-emerald-500/12 text-emerald-700 border border-emerald-500/25 dark:text-emerald-300"
              : "bg-slate-50 text-slate-400 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800"
          }`}
          title={`Spoken Attempts: ${wordStat.spokenAttempts} | Mastery Score: ${Math.round(wordStat.masteryScore * 10) / 10}`}
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0" />
          <span>{wordStat.spokenAttempts}</span>
          <span className="hidden sm:inline text-[10px] font-semibold opacity-75">
            Spoken
          </span>
        </div>
      </div>

      {/* Error Notice */}
      {isThisCardActive && error && status === "idle" && (
        <div className="mt-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Collapsible Phrases & Lemma Family Drawer */}
      {showLinks && linkedItems.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex flex-wrap gap-1.5">
            {linkedItems.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onSelectRelatedWord(rel.id)}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition"
              >
                <span>{rel.word}</span>
                {rel.translation && (
                  <span className="opacity-65">({rel.translation})</span>
                )}
                <ArrowUpRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}