// components/matrix/matrix-word-card.tsx
"use client";

import React from "react";
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
  RefreshCw,
} from "lucide-react";
import {
  CATEGORY_META,
  EnrichedWordStat,
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
  const isThisCardActive = activeMicWordId === wordStat.id;
  const isListening = isThisCardActive && status === "listening";
  const isAnalyzing = isThisCardActive && status === "analyzing";
  const isOtherCardBusy =
    status !== "idle" && activeMicWordId !== wordStat.id;

  const displayScore = sessionResult?.overall ?? wordStat.avgSpokenScore;

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
      className={`group relative rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 p-5 flex flex-col justify-between ${
        isListening
          ? "border-rose-500 ring-4 ring-rose-500/10 shadow-lg"
          : isAnalyzing
            ? "border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg"
            : "border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 hover:shadow-md"
      }`}
    >
      <div>
        {/* Top Header: Category Badge + Exposure Counters */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-lg border ${
              CATEGORY_META[wordStat.category].badgeClass
            }`}
          >
            {wordStat.categoryLabel}
          </span>

          <div className="flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1" title="Times Seen">
              <Eye className="w-3.5 h-3.5" />
              {wordStat.seenCount}
            </span>
            <span className="flex items-center gap-1" title="Times Heard">
              <Ear className="w-3.5 h-3.5" />
              {wordStat.heardCount}
            </span>
            <span className="flex items-center gap-1" title="Spoken Attempts">
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

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onListen(wordStat, 0.9)}
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
              onClick={() => onListen(wordStat, 0.6)}
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

        {/* Related Phrases */}
        {wordStat.relatedPhrases.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Used in phrases:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {wordStat.relatedPhrases.map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => onSelectRelatedWord(rel.id)}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 transition"
                >
                  <span>{rel.word}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Component Words */}
        {wordStat.componentWords.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Built from core word:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {wordStat.componentWords.map((comp) => (
                <button
                  key={comp.id}
                  onClick={() => onSelectRelatedWord(comp.id)}
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
            {displayScore !== null ? `${displayScore}%` : "Untested"}
          </div>
        </div>

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
                <p className="text-sm font-bold">{sessionResult.accuracy}%</p>
              </div>
            )}
            {sessionResult.fluency !== null && (
              <div>
                <p className="text-[10px] uppercase text-slate-400 font-semibold">
                  Fluency
                </p>
                <p className="text-sm font-bold">{sessionResult.fluency}%</p>
              </div>
            )}
          </div>
        )}

        {isThisCardActive && error && status === "idle" && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="line-clamp-2">{error}</span>
          </div>
        )}

        <button
          onClick={() => onPronunciationTest(wordStat)}
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
}