// components/matrix/matrix-word-detail-modal.tsx
"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  X,
  Volume2,
  Turtle,
  Mic,
  Square,
  Loader2,
  Eye,
  Ear,
  MousePointerClick,
  Sparkles,
  BookOpen,
  Tag,
  GitCommitHorizontal,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { EnrichedWordStat, SessionScore, WordStat } from "./matrix-types";

interface MatrixWordDetailModalProps {
  wordStat: EnrichedWordStat | null;
  activeMicWordId: string | null;
  status: string;
  activeTtsKey: string | null;
  isTtsPlaying: boolean;
  isTtsLoading: boolean;
  sessionResult?: SessionScore;
  onClose: () => void;
  onListen: (wordStat: WordStat, speed: number, gender?: "m" | "f") => void;
  onPronunciationTest: (wordStat: WordStat) => void;
  onSelectWord: (wordStat: EnrichedWordStat) => void;
  allEnrichedWords: EnrichedWordStat[];
}

function formatAgo(dateVal?: Date | string | null): string {
  if (!dateVal) return "Never";
  try {
    return formatDistanceToNow(new Date(dateVal), { addSuffix: true });
  } catch {
    return "Recently";
  }
}

export function MatrixWordDetailModal({
  wordStat,
  activeMicWordId,
  status,
  activeTtsKey,
  isTtsPlaying,
  isTtsLoading,
  sessionResult,
  onClose,
  onListen,
  onPronunciationTest,
  onSelectWord,
  allEnrichedWords,
}: MatrixWordDetailModalProps) {
  if (!wordStat) return null;

  const isListening =
    activeMicWordId === wordStat.id && status === "listening";
  const isAnalyzing =
    activeMicWordId === wordStat.id && status === "analyzing";
  const displayScore = sessionResult?.overall ?? wordStat.avgSpokenScore;
  const totalTaps = (wordStat.tappedCorrect || 0) + (wordStat.tappedWrong || 0);
  const tapAccuracy =
    totalTaps > 0 ? Math.round((wordStat.tappedCorrect / totalTaps) * 100) : null;

  const isPlayingM =
    activeTtsKey === `${wordStat.id}-0.9-m` && (isTtsPlaying || isTtsLoading);
  const isPlayingF =
    activeTtsKey === `${wordStat.id}-0.9-f` && (isTtsPlaying || isTtsLoading);
  const isPlayingSlow =
    activeTtsKey === `${wordStat.id}-0.6` && (isTtsPlaying || isTtsLoading);

  const linkedItems = [
    ...wordStat.relatedPhrases,
    ...wordStat.linkedComponentWords,
    ...wordStat.sameLemmaWords,
  ].filter(
    (item, idx, arr) => arr.findIndex((x) => x.id === item.id) === idx
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Glowing gradient border wrapper */}
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 p-[2px] shadow-[0_0_40px_-5px_rgba(99,102,241,0.7)] ring-1 ring-indigo-400/30 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Soft blurred glow layer behind the border */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-2 -z-10 rounded-[2rem] bg-gradient-to-br from-cyan-400 via-indigo-500 to-purple-500 opacity-50 blur-2xl animate-pulse"
        />

        <div className="relative w-full overflow-hidden rounded-[calc(1.5rem-2px)] bg-white dark:bg-slate-900">
          {/* TOP DARK HEADER BAND */}
          <div className="bg-slate-900 px-6 py-5 text-white dark:bg-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                    {wordStat.status}
                  </span>
                  <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-bold text-slate-300">
                    {wordStat.wordType === "PHRASE" ? "Phrase / Chunk" : "Single Word"}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <Clock className="h-3.5 w-3.5" />
                    Seen {formatAgo(wordStat.lastSeenAt)}
                  </span>
                </div>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  {wordStat.cleanWord}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-white/10 p-2 text-slate-300 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Action bar: Listen (F/M) + Slow + Try Speaking */}
            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onListen(wordStat, 0.9, "f")}
                disabled={status !== "idle"}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition active:scale-95 ${
                  isPlayingF
                    ? "animate-pulse bg-teal-400 text-slate-950"
                    : "bg-teal-500 text-slate-950 shadow-sm hover:bg-teal-400"
                }`}
              >
                <Volume2 className="h-4 w-4" />
                Listen (Female ♀)
              </button>

              <button
                type="button"
                onClick={() => onListen(wordStat, 0.9, "m")}
                disabled={status !== "idle"}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition active:scale-95 ${
                  isPlayingM
                    ? "animate-pulse bg-cyan-400 text-slate-950"
                    : "border border-cyan-500/30 bg-slate-800 text-cyan-300 hover:bg-slate-700"
                }`}
              >
                <Volume2 className="h-4 w-4" />
                Listen (Male ♂)
              </button>

              <button
                type="button"
                onClick={() => onListen(wordStat, 0.6)}
                disabled={status !== "idle"}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-extrabold transition active:scale-95 ${
                  isPlayingSlow
                    ? "animate-pulse border-amber-400 bg-amber-400 text-slate-950"
                    : "border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700"
                }`}
              >
                <Turtle className="h-4 w-4" />
                Slow (0.6x)
              </button>

              <button
                type="button"
                onClick={() => onPronunciationTest(wordStat)}
                disabled={isAnalyzing}
                className={`ml-auto inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold text-white shadow-md transition active:scale-95 ${
                  isListening
                    ? "animate-pulse bg-rose-600"
                    : isAnalyzing
                      ? "cursor-wait bg-indigo-600"
                      : "bg-indigo-600 hover:bg-indigo-500"
                }`}
              >
                {isListening ? (
                  <>
                    <Square className="h-3.5 w-3.5 fill-current" />
                    Stop Recording
                  </>
                ) : isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Scoring...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4" />
                    {displayScore !== null && displayScore !== undefined
                      ? `Try Again (${Math.round(displayScore)}%)`
                      : "Try Speaking"}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MODAL BODY */}
          <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
            {/* 1. Definition & Linguistic Breakdown */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  Definition / Meaning
                </div>
                <p className="mt-1.5 text-lg font-black text-slate-900 dark:text-white">
                  {wordStat.translation || "No translation recorded"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  <Tag className="h-4 w-4 text-teal-500" />
                  Grammar & Gender
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                    {wordStat.partOfSpeech || "VOCABULARY"}
                  </span>

                  {wordStat.grammaticalGender === "M" ? (
                    <span className="rounded-lg border border-sky-500/30 bg-sky-500/15 px-2.5 py-1 text-xs font-extrabold text-sky-700 dark:text-sky-300">
                      ♂ Masculine
                    </span>
                  ) : wordStat.grammaticalGender === "F" ? (
                    <span className="rounded-lg border border-pink-500/30 bg-pink-500/15 px-2.5 py-1 text-xs font-extrabold text-pink-700 dark:text-pink-300">
                      ♀ Feminine
                    </span>
                  ) : (
                    <span className="rounded-lg bg-slate-200/70 px-2.5 py-1 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      Neutral / Invariable
                    </span>
                  )}

                  {wordStat.lemma && (
                    <span className="inline-flex items-center gap-1 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-extrabold text-violet-700 dark:text-violet-300">
                      <GitCommitHorizontal className="h-3.5 w-3.5" />
                      Root: {wordStat.lemma}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 2. 4-Signal Performance & Timestamps */}
            <div>
              <h4 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Interaction History & Mastery ({Math.round(wordStat.masteryScore * 10) / 10} pts)
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-sky-700 dark:text-sky-300">
                    <Eye className="h-4 w-4" />
                    Seen
                  </div>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {wordStat.seenCount}x
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                    {formatAgo(wordStat.lastSeenAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                    <Ear className="h-4 w-4" />
                    Heard
                  </div>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {wordStat.heardCount}x
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                    {formatAgo(wordStat.lastHeardAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-700 dark:text-amber-300">
                    <MousePointerClick className="h-4 w-4" />
                    Tapped
                  </div>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {wordStat.tappedCorrect}/{totalTaps}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                    {tapAccuracy !== null ? `${tapAccuracy}% accuracy` : "No taps yet"}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="h-4 w-4" />
                    Spoken
                  </div>
                  <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {displayScore !== null && displayScore !== undefined
                      ? `${Math.round(displayScore)}%`
                      : `${wordStat.spokenAttempts}x`}
                  </p>
                  <p className="mt-0.5 text-[11px] font-semibold text-slate-400">
                    {wordStat.spokenAttempts} attempt{wordStat.spokenAttempts === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Connected Phrases & Root Family */}
            {linkedItems.length > 0 && (
              <div>
                <h4 className="mb-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Connected Words & Phrases ({linkedItems.length})
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {linkedItems.map((rel) => {
                    const fullRel = allEnrichedWords.find((e) => e.id === rel.id);
                    return (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => fullRel && onSelectWord(fullRel)}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left transition hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-800/60"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900 dark:text-white">
                            {rel.word}
                          </p>
                          <p className="truncate text-xs font-medium text-slate-500">
                            {rel.translation || rel.partOfSpeech}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-indigo-500" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}