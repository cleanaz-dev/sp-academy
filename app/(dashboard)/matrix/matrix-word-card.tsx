// components/matrix/matrix-word-card.tsx
"use client";

import React, { useState } from "react";
import {
  Eye,
  Ear,
  Mic,
  Volume2,
  Turtle,
  ArrowUpRight,
  AlertCircle,
  Square,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  CATEGORY_META,
  EnrichedWordStat,
  LexicalCategory,
  SessionScore,
  WordStat,
} from "./matrix-types";

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

const CARD_THEME: Record<
  LexicalCategory,
  {
    accentBar: string;
    playBtn: string;
    softBg: string;
  }
> = {
  GREETING: {
    accentBar: "bg-amber-400",
    playBtn:
      "bg-amber-500/15 text-amber-600 hover:bg-amber-500 hover:text-white dark:text-amber-400",
    softBg: "hover:border-amber-400/50",
  },
  PRONOUN: {
    accentBar: "bg-purple-500",
    playBtn:
      "bg-purple-500/15 text-purple-600 hover:bg-purple-600 hover:text-white dark:text-purple-400",
    softBg: "hover:border-purple-400/50",
  },
  VERB: {
    accentBar: "bg-rose-500",
    playBtn:
      "bg-rose-500/15 text-rose-600 hover:bg-rose-600 hover:text-white dark:text-rose-400",
    softBg: "hover:border-rose-400/50",
  },
  NOUN_PEOPLE: {
    accentBar: "bg-cyan-500",
    playBtn:
      "bg-cyan-500/15 text-cyan-600 hover:bg-cyan-600 hover:text-white dark:text-cyan-400",
    softBg: "hover:border-cyan-400/50",
  },
  EXPRESSION: {
    accentBar: "bg-indigo-500",
    playBtn:
      "bg-indigo-500/15 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:text-indigo-400",
    softBg: "hover:border-indigo-400/50",
  },
  VOCABULARY: {
    accentBar: "bg-teal-500",
    playBtn:
      "bg-teal-500/15 text-teal-600 hover:bg-teal-600 hover:text-white dark:text-teal-400",
    softBg: "hover:border-teal-400/50",
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
  const theme = CARD_THEME[wordStat.category] || CARD_THEME.VOCABULARY;

  const isPlayingNormal =
    activeTtsKey === `${wordStat.id}-0.9` && (isTtsPlaying || isTtsLoading);
  const isPlayingSlow =
    activeTtsKey === `${wordStat.id}-0.6` && (isTtsPlaying || isTtsLoading);

  const linkedItems =
    wordStat.relatedPhrases.length > 0
      ? wordStat.relatedPhrases
      : wordStat.componentWords;
  const linkedLabel =
    wordStat.relatedPhrases.length > 0
      ? `${wordStat.relatedPhrases.length} phrase${wordStat.relatedPhrases.length > 1 ? "s" : ""}`
      : `${wordStat.componentWords.length} root word${wordStat.componentWords.length > 1 ? "s" : ""}`;

  const getScoreBadgeStyle = (val: number | null) => {
    if (val === null)
      return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
    if (val >= 80)
      return "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:text-emerald-300";
    if (val >= 60)
      return "bg-amber-500/15 text-amber-700 border border-amber-500/30 dark:text-amber-300";
    return "bg-rose-500/15 text-rose-700 border border-rose-500/30 dark:text-rose-300";
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 px-4 py-3.5 shadow-xs ${
        isListening
          ? "border-rose-500 ring-4 ring-rose-500/15 shadow-md"
          : isAnalyzing
            ? "border-indigo-500 ring-4 ring-indigo-500/15 shadow-md"
            : `border-slate-200/90 dark:border-slate-800 ${theme.softBg} hover:shadow-md`
      }`}
    >
      {/* Left Color Accent Strip */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.accentBar}`}
      />

      {/* Row 1: Category Pill + Tiny Stats + Collapsible Links Trigger */}
      <div className="flex items-center justify-between gap-2 pl-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-extrabold tracking-wide px-2 py-0.5 rounded-full border ${
              CATEGORY_META[wordStat.category].badgeClass
            }`}
          >
            {wordStat.categoryLabel}
          </span>

          {linkedItems.length > 0 && (
            <button
              type="button"
              onClick={() => setShowLinks((prev) => !prev)}
              className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 transition"
            >
              <span>{linkedLabel}</span>
              {showLinks ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
          <span className="flex items-center gap-0.5" title="Times Seen">
            <Eye className="w-3 h-3" />
            {wordStat.seenCount}
          </span>
          <span className="flex items-center gap-0.5" title="Times Heard">
            <Ear className="w-3 h-3" />
            {wordStat.heardCount}
          </span>
        </div>
      </div>

      {/* Row 2: Main Rectangular Pill Content (Word/Gloss on Left, Play + Slow + Mic on Right) */}
      <div className="mt-2.5 flex items-center justify-between gap-3 pl-1.5">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {wordStat.cleanWord}
          </h3>
          <p className="truncate text-xs font-semibold text-slate-400 dark:text-slate-500">
            {wordStat.translation ||
              (wordStat.structuralType === "PHRASE"
                ? `${wordStat.tokens.length}-word chunk`
                : "Core word")}
          </p>
        </div>

        {/* Audio & Voice Pill Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Primary Play Button */}
          <button
            type="button"
            onClick={() => onListen(wordStat, 0.9)}
            disabled={status !== "idle"}
            title="Listen (Normal Speed)"
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-40 ${
              isPlayingNormal
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 animate-pulse"
                : theme.playBtn
            }`}
          >
            <Volume2 className="h-4.5 w-4.5" />
          </button>

          {/* Smaller Slow (Turtle) Button right beside it */}
          <button
            type="button"
            onClick={() => onListen(wordStat, 0.6)}
            disabled={status !== "idle"}
            title="Slow Speed (0.6x)"
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all active:scale-95 disabled:opacity-40 ${
              isPlayingSlow
                ? "border-amber-500 bg-amber-500 text-white animate-pulse"
                : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-600"
            }`}
          >
            <Turtle className="h-3.5 w-3.5" />
          </button>

          {/* Compact Mic / Score Action Pill */}
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
                    ? getScoreBadgeStyle(displayScore)
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

      {/* Slim Bottom Accent Progress Bar (only when scored) */}
      {displayScore !== null && (
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 pl-1.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              displayScore >= 80
                ? "bg-emerald-500"
                : displayScore >= 60
                  ? "bg-amber-500"
                  : "bg-rose-500"
            }`}
            style={{ width: `${displayScore}%` }}
          />
        </div>
      )}

      {/* Error Notice */}
      {isThisCardActive && error && status === "idle" && (
        <div className="mt-2 rounded-xl bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}

      {/* Hidden-by-default Collapsible Phrases Drawer */}
      {showLinks && linkedItems.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 pl-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex flex-wrap gap-1.5">
            {linkedItems.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onSelectRelatedWord(rel.id)}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition"
              >
                <span>{rel.word}</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}