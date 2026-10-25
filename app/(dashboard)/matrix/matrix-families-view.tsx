// components/matrix/matrix-families-view.tsx
"use client";

import React from "react";
import { Volume2, Mic, Turtle } from "lucide-react";
import { EnrichedWordStat, WordStat } from "./matrix-types";

interface MatrixFamiliesViewProps {
  groups: Array<{
    root: EnrichedWordStat;
    phrases: EnrichedWordStat[];
  }>;
  onListen: (wordStat: WordStat, speed: number) => void;
  onPronunciationTest: (wordStat: WordStat) => void;
}

export function MatrixFamiliesView({
  groups,
  onListen,
  onPronunciationTest,
}: MatrixFamiliesViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">
            🧬 How Word Families Work
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Instead of memorizing isolated words, practice how a root building
            block (like <strong>&ldquo;je&rdquo;</strong>) flows into natural
            phrases (like <strong>&ldquo;je suis&rdquo;</strong>).
          </p>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-500">
            No multi-word families linked yet. Keep learning phrases to see how
            your single words connect!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {groups.map(({ root, phrases }) => (
            <div
              key={root.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Left: Root Building Block */}
                <div className="lg:w-1/3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    🧱 Root Word
                  </span>
                  <div className="flex items-center justify-between mt-3">
                    <h4 className="text-2xl font-extrabold">
                      {root.cleanWord}
                    </h4>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onListen(root, 0.9)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:text-indigo-600"
                        title="Normal Speed"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onPronunciationTest(root)}
                        className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        {root.avgSpokenScore !== null
                          ? `${root.avgSpokenScore}%`
                          : "Speak"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Connected Phrases */}
                <div className="flex-1 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Builds Into Phrases ({phrases.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {phrases.map((phrase) => (
                      <div
                        key={phrase.id}
                        className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-500/40 transition"
                      >
                        <div>
                          <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                            💬 Connected Phrase
                          </span>
                          <p className="text-lg font-bold">
                            {phrase.cleanWord}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => onListen(phrase, 0.9)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-indigo-600"
                            title="Listen Normal"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onListen(phrase, 0.6)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-amber-600"
                            title="Listen Slow (0.6x)"
                          >
                            <Turtle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPronunciationTest(phrase)}
                            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1"
                          >
                            <Mic className="w-3.5 h-3.5" />
                            {phrase.avgSpokenScore !== null
                              ? `${phrase.avgSpokenScore}%`
                              : "Test"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}