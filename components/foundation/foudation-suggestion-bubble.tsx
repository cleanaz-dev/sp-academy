"use client";

import { Volume2, Loader2, X, Lightbulb } from "lucide-react";
import { useFoundation } from "@/context/foundation-context";

export function FoundationSuggestionBubble() {
  const {
    suggestions,
    isSuggestionVisible,
    dismissSuggestion,
    handleReplay,
    isPlaying,
    isSpeechLoading,
  } = useFoundation();

  if (!isSuggestionVisible || !suggestions) return null;

  const isBusy = isPlaying || isSpeechLoading;

  return (
    <div className="flex justify-end animate-in slide-in-from-bottom-2">
      <div className="relative max-w-[85%] rounded-3xl rounded-br-sm border border-dashed border-amber-400/40 bg-amber-400/5 px-5 py-4 pr-10">
        {/* Remove */}
        <button
          type="button"
          onClick={dismissSuggestion}
          aria-label="Hide suggestion"
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-amber-200/60 transition hover:bg-white/10 hover:text-amber-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-300">
          <Lightbulb className="h-3.5 w-3.5" />
          Try saying
        </div>

        <div className="flex items-start gap-2">
          <p className="text-[15px] font-semibold leading-relaxed text-white">
            {suggestions.starter}
          </p>
          <button
            type="button"
            onClick={() => handleReplay(suggestions.starter)}
            disabled={isBusy}
            aria-label="Listen to suggestion"
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-amber-200 transition hover:bg-white/10 disabled:opacity-40"
          >
            {isSpeechLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Volume2 className={`h-3.5 w-3.5 ${isPlaying ? "animate-pulse" : ""}`} />
            )}
          </button>
        </div>

        {suggestions.starterTranslation && (
          <p className="mt-0.5 text-sm italic text-slate-400">
            {suggestions.starterTranslation}
          </p>
        )}

        {!!suggestions.vocabulary?.length && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {suggestions.vocabulary.map((v) => (
              <li
                key={v.word}
                className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs"
              >
                <span className="font-semibold text-amber-100">{v.word}</span>
                <span className="ml-1.5 text-amber-200/70">{v.definition}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}