"use client";

import { Square, Mic, Send, RotateCcw, Lightbulb, Loader2 } from "lucide-react";

import { useFoundation } from "@/context/foundation-context";

const iconButton =
  "flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-xl transition-all duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400";

export function FoundationFreestyleControls() {
  const {
    isRecording,
    isProcessing,
    canRetry,
    handleEndSession,
    startRecording,
    submitTurn,
    handleRetry,
    // suggestions
    suggestionsLeft,
    canSuggest,
    isSuggestionVisible,
    isSuggestionsLoading,
    handleGetSuggestion,
  } = useFoundation();

  const outOfSuggestions = suggestionsLeft <= 0;

  return (
    <div className="z-10 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl md:rounded-3xl border border-slate-800 bg-slate-900 px-4 py-2">
      {/* LEFT: end session */}
      <div className="flex justify-start">
        <button
          onClick={handleEndSession}
          className={`${iconButton} bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300`}
          title="End Session"
        >
          <Square className="h-5 w-5 fill-current" />
        </button>
      </div>

      {/* CENTER: mic / send */}
      <div className="flex justify-center">
        {isRecording ? (
          <button
            onClick={submitTurn}
            title="Send"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-[0_0_24px_-4px_rgba(16,185,129,0.7)] ring-4 ring-emerald-500/20 transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-emerald-300"
          >
            <Send className="ml-1 h-6 w-6" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            title="Speak"
            className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
              isProcessing
                ? "cursor-not-allowed bg-slate-800 text-slate-500"
                : "bg-indigo-600 text-white shadow-[0_0_24px_-4px_rgba(99,102,241,0.7)] hover:-translate-y-0.5 hover:bg-indigo-500 active:translate-y-0"
            }`}
          >
            <Mic className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* RIGHT: suggestion (limited) + retry (unlimited) */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={handleGetSuggestion}
          disabled={!canSuggest}
          title={
            outOfSuggestions
              ? "No suggestions left"
              : `Get a suggestion (${suggestionsLeft} left)`
          }
          className={`${iconButton} ${
            canSuggest
              ? "text-amber-400 hover:bg-amber-400/10 hover:text-amber-300 active:scale-95"
              : isSuggestionVisible
              ? "cursor-default bg-amber-400/10 text-amber-400"
              : "cursor-not-allowed text-slate-500"
          }`}
        >
          {isSuggestionsLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Lightbulb
              className={`h-5 w-5 ${isSuggestionVisible ? "fill-current" : ""}`}
            />
          )}
          <span className="text-[10px] font-bold leading-none">
            {suggestionsLeft} left
          </span>
        </button>

        <button
          onClick={handleRetry}
          disabled={!canRetry}
          title="Retry"
          className={`${iconButton} ${
            canRetry
              ? "text-slate-300 hover:bg-white/5 hover:text-white active:scale-95"
              : "cursor-not-allowed text-slate-500"
          }`}
        >
          <RotateCcw className="h-5 w-5" />
          <span className="text-[10px] font-bold leading-none">Retry</span>
        </button>
      </div>
    </div>
  );
}