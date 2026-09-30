"use client";

import { Volume2, Loader2 } from "lucide-react";
import { useFoundation } from "@/context/foundation-context";

export function FoundationIntroOrSuggestion({ intro }: { intro: string }) {
  const {
    suggestions,
    isSuggestionVisible,
    handleReplay,
    isPlaying,
    isSpeechLoading,
  } = useFoundation();

  const showSuggestion = isSuggestionVisible && !!suggestions;

  return (
    <div
      className="mx-auto flex min-h-[4rem] max-w-2xl flex-col items-center justify-center text-center"
      aria-live="polite"
    >
      {showSuggestion ? (
        <div key="suggestion" className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <p className="text-lg text-slate-200">
              <span className="font-semibold text-white">
                {suggestions.starter}
              </span>
              <span className="ml-2 text-sm italic text-slate-400">
                {suggestions.starterTranslation}
              </span>
            </p>

            <button
              type="button"
              onClick={() => handleReplay(suggestions.starter)}
              disabled={isPlaying || isSpeechLoading}
              aria-label="Listen to suggested sentence"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 disabled:opacity-50"
            >
              {isSpeechLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </button>
          </div>

          <ul className="flex flex-wrap justify-center gap-2">
            {suggestions.vocabulary?.map((v) => (
              <li
                key={v.word}
                className="rounded-full border border-amber-400/25 bg-amber-400/10 px-3 py-1 text-xs"
              >
                <span className="font-semibold text-amber-100">{v.word}</span>
                <span className="ml-1.5 text-amber-200/70">{v.definition}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p key="intro" className="text-lg text-slate-400">
          {intro}
        </p>
      )}
    </div>
  );
}