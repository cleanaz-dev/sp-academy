"use client";

import { useFoundation } from "@/context/foundation-context";

/**
 * Sits under the mission title. Shows the intro line by default and swaps in
 * the AI suggestion after the learner taps the lightbulb.
 * Must be rendered INSIDE <FoundationProvider>.
 */
export function FoundationIntroOrSuggestion({ intro }: { intro: string }) {
  const { suggestions, isSuggestionVisible } = useFoundation();

  const showSuggestion = isSuggestionVisible && !!suggestions;

  return (
    <div
      className="mx-auto flex min-h-[4rem] max-w-2xl flex-col items-center justify-center text-center"
      aria-live="polite"
    >
      {showSuggestion ? (
        <div key="suggestion" className="flex flex-col items-center gap-2">
          <p className="text-lg text-slate-200">
            <span className="font-semibold text-white">{suggestions.starter}</span>
            <span className="ml-2 text-sm italic text-slate-400">
              {suggestions.starterTranslation}
            </span>
          </p>

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