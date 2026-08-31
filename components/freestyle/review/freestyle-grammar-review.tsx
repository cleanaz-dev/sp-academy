"use client";

import { useState } from "react";
import type { ReviewMistake } from "@/lib/types/review";

interface Props {
  mistakes: ReviewMistake[];
  onComplete: () => void;
}

const severityColor = {
  minor: "border-yellow-400 bg-yellow-50",
  major: "border-orange-400 bg-orange-50",
  critical: "border-red-400 bg-red-50",
};

export function FreestyleGrammarReview({ mistakes, onComplete }: Props) {
  const [index, setIndex] = useState(0);

  if (!mistakes.length) {
    return (
      <div className="text-center p-8 space-y-4 animate-in fade-in">
        <div className="text-4xl">🎉</div>
        <p className="text-lg font-bold text-gray-800">Zero grammar mistakes!</p>
        <p className="text-gray-500">Your sentence structure was solid this session.</p>
        <button
          onClick={onComplete}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all"
        >
          Continue →
        </button>
      </div>
    );
  }

  const current = mistakes[index];
  const isLast = index === mistakes.length - 1;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md uppercase">
            Grammar
          </span>
          <span
            className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${
              current.severity === "critical"
                ? "bg-red-100 text-red-700"
                : current.severity === "major"
                ? "bg-orange-100 text-orange-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {current.severity}
          </span>
        </div>
        <span className="text-sm font-bold text-gray-400">
          {index + 1} / {mistakes.length}
        </span>
      </div>

      <div className="space-y-3">
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">You said</p>
          <p className="text-lg text-gray-800 font-medium">"{current.original}"</p>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
          <p className="text-xs text-green-600 uppercase tracking-wide mb-1">Correction</p>
          <p className="text-lg text-green-800 font-bold">"{current.correction}"</p>
        </div>

        <div className={`border-l-4 p-4 rounded-r-lg ${severityColor[current.severity]}`}>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Why</p>
          <p className="text-sm text-gray-800 leading-relaxed">{current.explanation}</p>
        </div>
      </div>

      <button
        onClick={() => (isLast ? onComplete() : setIndex((i) => i + 1))}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md transition-all active:scale-95"
      >
        {isLast ? "Complete Phase ✓" : "Next →"}
      </button>
    </div>
  );
}