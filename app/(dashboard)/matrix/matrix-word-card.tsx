// components/matrix/matrix-word-card.tsx
"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
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
  BookOpen,
  Tag,
  GitCommitHorizontal,
  Clock,
  Info,
} from "lucide-react";
import { EnrichedWordStat, SessionScore, WordStat } from "./matrix-types";

interface MatrixWordCardProps {
  wordStat: EnrichedWordStat;
  index?: number;
  activeMicWordId: string | null;
  status: string;
  error: string | null;
  activeTtsKey: string | null;
  isTtsPlaying: boolean;
  isTtsLoading: boolean;
  sessionResult?: SessionScore;
  onListen: (wordStat: WordStat, speed: number, gender?: "m" | "f") => void;
  onPronunciationTest: (wordStat: WordStat) => void;
  onSelectRelatedWord: (wordId: string) => void;
  onOpenDetail?: (wordStat: EnrichedWordStat) => void;
}

const STATUS_STYLE: Record<string, string> = {
  MASTERED: "bg-emerald-500/20 text-emerald-300 border-emerald-400/30",
  FAMILIAR: "bg-cyan-500/20 text-cyan-300 border-cyan-400/30",
  LEARNING: "bg-indigo-500/20 text-indigo-300 border-indigo-400/30",
  NEW: "bg-slate-700 text-slate-300 border-slate-600",
};

export function MatrixWordCard({
  wordStat,
  index = 0,
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
  onOpenDetail,
}: MatrixWordCardProps) {
  const [showLinks, setShowLinks] = useState(false);

  const isThisCardActive = activeMicWordId === wordStat.id;
  const isListening = isThisCardActive && status === "listening";
  const isAnalyzing = isThisCardActive && status === "analyzing";
  const isOtherCardBusy =
    status !== "idle" && activeMicWordId !== wordStat.id;

  const displayScore = sessionResult?.overall ?? wordStat.avgSpokenScore;

  const isPlayingNormal =
    (activeTtsKey === `${wordStat.id}-0.9` ||
      activeTtsKey === `${wordStat.id}-0.9-f`) &&
    (isTtsPlaying || isTtsLoading);
  const isPlayingSlow =
    activeTtsKey === `${wordStat.id}-0.6` && (isTtsPlaying || isTtsLoading);

  const linkedItems = [
    ...wordStat.relatedPhrases,
    ...wordStat.linkedComponentWords,
    ...wordStat.sameLemmaWords,
  ].filter(
    (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx
  );

  // Format lastSeenAt with date-fns
  let lastSeenLabel = "Recently";
  try {
    if (wordStat.lastSeenAt) {
      lastSeenLabel = formatDistanceToNow(new Date(wordStat.lastSeenAt), {
        addSuffix: true,
      });
    }
  } catch {
    lastSeenLabel = "Recently";
  }

  // Every other card gets a slightly darker/tinted body so the grid is easy to follow
  const isAlternate = index % 2 === 1;

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-200 ${
        isAlternate
          ? "bg-slate-100/90 border-slate-300/90 dark:bg-slate-900/90 dark:border-slate-800"
          : "bg-white border-slate-200/90 dark:bg-slate-900 dark:border-slate-800"
      } ${
        isListening
          ? "border-rose-500 ring-4 ring-rose-500/15 shadow-lg"
          : isAnalyzing
            ? "border-indigo-500 ring-4 ring-indigo-500/15 shadow-lg"
            : "hover:border-indigo-400 hover:shadow-md"
      }`}
    >
      {/* ====================================================================
          1. TOP HEADER BAND (Slightly Dark BG: Word on Left, Listen + Try on Right)
      ==================================================================== */}
      <div className="flex items-center justify-between gap-2 bg-slate-800 px-4 py-3 text-white dark:bg-slate-950">
        <button
          type="button"
          onClick={() => onOpenDetail?.(wordStat)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left group/title"
          title="Click for full word details"
        >
          <h3 className="truncate text-lg font-black tracking-tight text-white group-hover/title:text-cyan-300 transition">
            {wordStat.cleanWord}
          </h3>
          <span
            className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
              STATUS_STYLE[wordStat.status] || STATUS_STYLE.NEW
            }`}
          >
            {wordStat.status}
          </span>
        </button>

        {/* Action Buttons: Listen (Secondary Teal) + Slow (Amber) + Try (Primary Indigo) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onListen(wordStat, 0.9, "f")}
            disabled={status !== "idle"}
            title="Listen"
            className={`inline-flex h-8 items-center gap-1 rounded-xl px-2.5 text-xs font-extrabold transition active:scale-95 disabled:opacity-40 ${
              isPlayingNormal
                ? "bg-teal-300 text-slate-950 animate-pulse"
                : "bg-teal-400 text-slate-950 hover:bg-teal-300 shadow-xs"
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Listen</span>
          </button>

          <button
            type="button"
            onClick={() => onListen(wordStat, 0.6)}
            disabled={status !== "idle"}
            title="Listen Slow (0.6x)"
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition active:scale-95 disabled:opacity-40 ${
              isPlayingSlow
                ? "border-amber-400 bg-amber-400 text-slate-950 animate-pulse"
                : "border-slate-600 bg-slate-700/80 text-amber-300 hover:border-amber-400 hover:bg-slate-700"
            }`}
          >
            <Turtle className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onPronunciationTest(wordStat)}
            disabled={isAnalyzing || isOtherCardBusy}
            className={`inline-flex h-8 items-center gap-1 rounded-xl px-3 text-xs font-extrabold text-white shadow-xs transition active:scale-95 disabled:opacity-40 ${
              isListening
                ? "bg-rose-600 animate-pulse"
                : isAnalyzing
                  ? "bg-indigo-600 cursor-wait"
                  : displayScore !== null
                    ? displayScore >= 80
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-amber-600 hover:bg-amber-500"
                    : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            {isListening ? (
              <>
                <Square className="h-3 w-3 fill-current" />
                <span>Stop</span>
              </>
            ) : isAnalyzing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : displayScore !== null ? (
              <>
                <Mic className="h-3 w-3" />
                <span>{Math.round(displayScore)}%</span>
              </>
            ) : (
              <>
                <Mic className="h-3 w-3" />
                <span>Try</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ====================================================================
          2. MIDDLE BODY (Definition + Gender + POS + Root + date-fns Last Seen)
      ==================================================================== */}
      <div
        onClick={() => onOpenDetail?.(wordStat)}
        className="flex-1 cursor-pointer px-4 py-3.5 space-y-2.5"
      >
        {/* Definition Row with Icon (Never truncated into unreadable "thi...") */}
        <div className="flex items-start gap-2">
          <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
          <p className="text-sm font-extrabold leading-snug text-slate-800 dark:text-slate-100">
            {wordStat.translation || "—"}
          </p>
        </div>

        {/* Clean Metadata Row with Icons: POS + Gender + Root + Last Seen */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
          {/* Part of Speech */}
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-200/75 dark:bg-slate-800 px-2 py-0.5 text-slate-700 dark:text-slate-300">
            <Tag className="h-3 w-3 text-indigo-500" />
            {wordStat.partOfSpeech || wordStat.structuralType}
          </span>

          {/* Gender Badge (Always shown clearly) */}
          {wordStat.grammaticalGender === "M" ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 text-sky-700 dark:text-sky-300">
              ♂ Masc
            </span>
          ) : wordStat.grammaticalGender === "F" ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-pink-500/15 border border-pink-500/30 px-2 py-0.5 text-pink-700 dark:text-pink-300">
              ♀ Fem
            </span>
          ) : null}

          {/* Root Lemma (if distinct) */}
          {wordStat.lemma &&
            wordStat.lemma.toLowerCase() !==
              wordStat.cleanWord.toLowerCase() && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-violet-700 dark:text-violet-300">
                <GitCommitHorizontal className="h-3 w-3" />
                {wordStat.lemma}
              </span>
            )}

          {/* Last Seen (date-fns) */}
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Clock className="h-3 w-3 text-slate-400" />
            {lastSeenLabel}
          </span>
        </div>
      </div>

      {/* ====================================================================
          3. BOTTOM FOOTER (Hits: Seen / Heard / Tap / Spoken + Related & Details)
      ==================================================================== */}
      <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex items-center gap-3">
          <span
            title="Times Seen"
            className={`inline-flex items-center gap-1 font-extrabold ${
              wordStat.seenCount > 0
                ? "text-sky-600 dark:text-sky-400"
                : "text-slate-400"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            {wordStat.seenCount}
          </span>

          <span
            title="Times Heard"
            className={`inline-flex items-center gap-1 font-extrabold ${
              wordStat.heardCount > 0
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400"
            }`}
          >
            <Ear className="h-3.5 w-3.5" />
            {wordStat.heardCount}
          </span>

          <span
            title="Correct Taps"
            className={`inline-flex items-center gap-1 font-extrabold ${
              wordStat.tappedCorrect > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-400"
            }`}
          >
            <MousePointerClick className="h-3.5 w-3.5" />
            {wordStat.tappedCorrect}
          </span>

          <span
            title="Times Spoken"
            className={`inline-flex items-center gap-1 font-extrabold ${
              wordStat.spokenAttempts > 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400"
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            {wordStat.spokenAttempts}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {linkedItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowLinks((prev) => !prev)}
              className="inline-flex items-center gap-0.5 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-extrabold text-indigo-600 hover:bg-indigo-500/20 dark:text-indigo-300 transition"
            >
              <span>{linkedItems.length} related</span>
              {showLinks ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenDetail?.(wordStat)}
            title="Open Full Word Details"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Error Notice */}
      {isThisCardActive && error && status === "idle" && (
        <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/20 text-[11px] text-rose-600 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Collapsible Related Drawer */}
      {showLinks && linkedItems.length > 0 && (
        <div className="border-t border-dashed border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900 flex flex-wrap gap-1.5 animate-in fade-in duration-150">
          {linkedItems.map((rel) => (
            <button
              key={rel.id}
              type="button"
              onClick={() => onSelectRelatedWord(rel.id)}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition"
            >
              <span>{rel.word}</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}