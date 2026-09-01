// components/freestyle/freestyle-suggestions-panel.tsx
"use client";

import { Lightbulb, MessageSquareDashed, BookOpen, Loader2 } from "lucide-react";

export interface SuggestionData {
  startingSentence: string;
  finishingSentence: string;
  vocabulary: { word: string; definition: string }[];
}

interface FreestyleSuggestionsPanelProps {
  suggestions: SuggestionData | null;
  isLoading?: boolean;
}

export function FreestyleSuggestionsPanel({ suggestions, isLoading }: FreestyleSuggestionsPanelProps) {
  return (
    <div className="hidden w-1/4 max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-black/5 ring-1 ring-black/5 lg:flex">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-5 py-4">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-semibold text-gray-900">Suggestions</h3>
      </div>
      
      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-5">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center space-y-3 text-gray-400 opacity-70">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-xs font-medium">Generating hints...</p>
          </div>
        ) : !suggestions ? (
          <div className="flex h-full flex-col items-center justify-center text-center opacity-60">
            <p className="text-sm text-gray-500">Hints will appear here after the AI speaks.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Sentences Section */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Try Saying...
              </p>
              <div className="space-y-3">
                <div className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/30">
                  <MessageSquareDashed className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                  <div>
                    <span className="block text-xs font-medium text-gray-400 mb-1">Sentence Starter</span>
                    <span>{suggestions.startingSentence}</span>
                  </div>
                </div>
                <div className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/30">
                  <MessageSquareDashed className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <div>
                    <span className="block text-xs font-medium text-gray-400 mb-1">Sentence Finisher</span>
                    <span>{suggestions.finishingSentence}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vocabulary Section */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <BookOpen className="h-3.5 w-3.5" />
                Helpful Words
              </div>
              <div className="grid grid-cols-1 gap-2">
                {suggestions.vocabulary.map((v, i) => (
                  <div key={i} className="flex flex-col rounded-lg bg-white px-3 py-2 border border-gray-100 shadow-sm">
                    <span className="text-sm font-bold text-gray-900">{v.word}</span>
                    <span className="text-xs text-gray-500">{v.definition}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}