// components/matrix/matrix-dojo-modal.tsx
"use client";

import React from "react";
import {
  X,
  Volume2,
  Turtle,
  Square,
  Loader2,
  Mic,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import {
  CATEGORY_META,
  EnrichedWordStat,
  SessionScore,
  WordStat,
} from "./matrix-types";

interface MatrixDojoModalProps {
  isOpen: boolean;
  activeDojoWord: EnrichedWordStat | null;
  dojoIndex: number;
  dojoQueueLength: number;
  activeMicWordId: string | null;
  status: string;
  sessionResult?: SessionScore;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onListen: (wordStat: WordStat, speed: number) => void;
  onPronunciationTest: (wordStat: WordStat) => void;
}

export function MatrixDojoModal({
  isOpen,
  activeDojoWord,
  dojoIndex,
  dojoQueueLength,
  activeMicWordId,
  status,
  sessionResult,
  onClose,
  onPrev,
  onNext,
  onListen,
  onPronunciationTest,
}: MatrixDojoModalProps) {
  if (!isOpen || !activeDojoWord) return null;

  const isListening =
    activeMicWordId === activeDojoWord.id && status === "listening";
  const isAnalyzing =
    activeMicWordId === activeDojoWord.id && status === "analyzing";
  const currentScore = sessionResult?.overall ?? activeDojoWord.avgSpokenScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header & Progress */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              Word {dojoIndex + 1} of {dojoQueueLength}
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
            onClick={onClose}
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
              width: `${((dojoIndex + 1) / dojoQueueLength) * 100}%`,
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

          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => onListen(activeDojoWord, 0.9)}
              disabled={status !== "idle"}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-sm font-semibold text-slate-700 dark:text-slate-200 transition"
            >
              <Volume2 className="w-4 h-4 text-indigo-500" />
              Listen (1.0x)
            </button>
            <button
              onClick={() => onListen(activeDojoWord, 0.6)}
              disabled={status !== "idle"}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-sm font-semibold text-slate-700 dark:text-slate-200 transition"
            >
              <Turtle className="w-4 h-4 text-amber-500" />
              Slow (0.6x)
            </button>
          </div>
        </div>

        {/* Score Display if Tested */}
        {currentScore !== null && status === "idle" && (
          <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase">
              Pronunciation Score
            </p>
            <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              {currentScore}%
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {currentScore >= 80
                ? "🎉 Excellent pronunciation! Ready for the next word."
                : "💡 Tip: Try listening at 0.6x Slow speed and speak again!"}
            </p>
          </div>
        )}

        {/* Big Microphone Button */}
        <button
          onClick={() => onPronunciationTest(activeDojoWord)}
          disabled={status === "analyzing"}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-lg ${
            isListening
              ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
              : isAnalyzing
                ? "bg-indigo-600 text-white cursor-wait"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {isListening ? (
            <>
              <Square className="w-5 h-5 fill-current" />
              <span>Listening... Tap to Stop</span>
            </>
          ) : isAnalyzing ? (
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

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onPrev}
            disabled={dojoIndex === 0 || status !== "idle"}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {dojoIndex < dojoQueueLength - 1 ? (
            <button
              onClick={onNext}
              disabled={status !== "idle"}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold"
            >
              Next Word
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold"
            >
              <CheckCircle2 className="w-4 h-4" />
              Finish Drill
            </button>
          )}
        </div>
      </div>
    </div>
  );
}