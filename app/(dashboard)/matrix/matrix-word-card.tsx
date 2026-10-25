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
  onListen: (wordStat: WordStat, speed: number, gender?: "m" | "f") => void;
  onPronunciationTest: (wordStat: WordStat) => void;
  onSelectRelatedWord: (wordId: string) => void;
}

const STATUS_DOT: Record<string, { dot: string; label: string }> = {
  MASTERED: { dot: "bg-emerald-500", label: "Mastered" },
  FAMILIAR: { dot: "bg-cyan-500", label: "Familiar" },
  LEARNING: { dot: "bg-indigo-500", label: "Learning" },
  NEW: { dot: "bg-slate-300 dark:bg-slate-600", label: "New" },
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

  const statusMeta = STATUS_DOT[wordStat.status] || STATUS_DOT.NEW;

  // Build one clean, quiet linguistic subtitle line instead of 5 competing pills
  const metaParts: string[] = [];
  if (wordStat.partOfSpeech && wordStat.partOfSpeech !== "OTHER") {
    metaParts.push(
      wordStat.partOfSpeech.charAt(0) +
        wordStat.partOfSpeech.slice(1).toLowerCase()
    );
  }
  if (wordStat.grammaticalGender === "M") metaParts.push("Masc");
  if (wordStat.grammaticalGender === "F") metaParts.push("Fem");
  if (
    wordStat.lemma &&
    wordStat.lemma.toLowerCase() !== wordStat.cleanWord.toLowerCase()
  ) {
    metaParts.push(`Root: ${wordStat.lemma}`);
  }

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 px-5 py-4 ${
        isListening
          ? "border-rose-500 ring-4 ring-rose-500/15 shadow-md"
          : isAnalyzing
            ? "border-indigo-500 ring-4 ring-indigo-500/15 shadow-md"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* TOP ZONE: Word + Translation on Left | Play + Slow + Speak on Right */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              title={statusMeta.label}
              className={`h-2 w-2 shrink-0 rounded-full ${statusMeta.dot}`}
            />
            <h3 className="truncate text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              {wordStat.cleanWord}
            </h3>
          </div>

          <div className="mt-0.5 flex items-center gap-2 pl-4">
            <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
              {wordStat.translation || "—"}
            </p>
            {metaParts.length > 0 && (
              <span className="shrink-0 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                • {metaParts.join(" · ")}
              </span>
            )}
          </div>
        </div>

        {/* Clean 3-Button Audio & Voice Cluster */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onListen(wordStat, 0.9, "f")}
            disabled={status !== "idle"}
            title="Listen"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-40 ${
              isPlayingNormal
                ? "bg-indigo-600 text-white shadow-sm animate-pulse"
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:text-indigo-400"
            }`}
          >
            <Volume2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => onListen(wordStat, 0.6)}
            disabled={status !== "idle"}
            title="Slow (0.6x)"
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all active:scale-95 disabled:opacity-40 ${
              isPlayingSlow
                ? "border-amber-500 bg-amber-500 text-white animate-pulse"
                : "border-slate-200 bg-white text-slate-400 hover:border-amber-400 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-800"
            }`}
          >
            <Turtle className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onPronunciationTest(wordStat)}
            disabled={isAnalyzing || isOtherCardBusy}
            className={`ml-1 inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-40 ${
              isListening
                ? "bg-rose-600 text-white animate-pulse"
                : isAnalyzing
                  ? "bg-indigo-600 text-white cursor-wait"
                  : displayScore !== null
                    ? displayScore >= 80
                      ? "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white dark:text-emerald-300"
                      : "bg-amber-500/15 text-amber-700 border border-amber-500/30 hover:bg-amber-500 hover:text-white dark:text-amber-300"
                    : "bg-slate-900 text-white hover:bg-indigo-600 dark:bg-slate-800"
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
                <span>Speak</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* BOTTOM ZONE: Unified, Quiet 4-Stat Footer + Optional Expand Trigger */}
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800/80">
        <div className="flex items-center gap-4">
          <span
            title="Times Seen"
            className={` inline-flex items-center gap-1 font-bold ${
              wordStat.seenCount > 0 ? "text-sky-600 dark:text-sky-400" : "text-slate-300 dark:text-slate-600"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            {wordStat.seenCount}
          </span>

          <span
            title="Times Heard"
            className={`inline-flex items-center gap-1 font-bold ${
              wordStat.heardCount > 0 ? "text-indigo-600 dark:text-indigo-400" : "text-slate-300 dark:text-slate-600"
            }`}
          >
            <Ear className="h-3.5 w-3.5" />
            {wordStat.heardCount}
          </span>

          <span
            title="Correct Taps"
            className={`inline-flex items-center gap-1 font-bold ${
              wordStat.tappedCorrect > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-300 dark:text-slate-600"
            }`}
          >
            <MousePointerClick className="h-3.5 w-3.5" />
            {wordStat.tappedCorrect}
          </span>

          <span
            title="Times Spoken"
            className={`inline-flex items-center gap-1 font-bold ${
              wordStat.spokenAttempts > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-300 dark:text-slate-600"
            }`}
          >
            <Mic className="h-3.5 w-3.5" />
            {wordStat.spokenAttempts}
          </span>
        </div>

        {linkedItems.length > 0 && (
          <button
            type="button"
            onClick={() => setShowLinks((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-indigo-600 transition"
          >
            <span>
              {linkedItems.length} related
            </span>
            {showLinks ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Error Notice */}
      {isThisCardActive && error && status === "idle" && (
        <div className="mt-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 text-[11px] text-rose-600 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Collapsible Related Drawer */}
      {showLinks && linkedItems.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-dashed border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5 animate-in fade-in duration-150">
          {linkedItems.map((rel) => (
            <button
              key={rel.id}
              type="button"
              onClick={() => onSelectRelatedWord(rel.id)}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 transition"
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