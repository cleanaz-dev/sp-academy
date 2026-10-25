// components/matrix/matrix-filter-bar.tsx
"use client";

import React from "react";
import {
  Layers,
  Blocks,
  MessageSquareQuote,
  GitBranch,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { SortByOption, ViewMode } from "./matrix-types";

interface MatrixFilterBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  statsSummary: {
    total: number;
    singleWordsCount: number;
    phrasesCount: number;
  };
  familiesCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categoryFilter: string;
  onCategoryChange: (cat: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  sortBy: SortByOption;
  onSortChange: (sort: SortByOption) => void;
}

export function MatrixFilterBar({
  viewMode,
  onViewModeChange,
  statsSummary,
  familiesCount,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange,
}: MatrixFilterBarProps) {
  return (
    <>
      {/* Structural View Mode Tabs + Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onViewModeChange("ALL")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              viewMode === "ALL"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>All Items ({statsSummary.total})</span>
          </button>

          <button
            onClick={() => onViewModeChange("WORDS")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              viewMode === "WORDS"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <Blocks className="w-4 h-4" />
            <span>Single Words ({statsSummary.singleWordsCount})</span>
          </button>

          <button
            onClick={() => onViewModeChange("PHRASES")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              viewMode === "PHRASES"
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-slate-300"
            }`}
          >
            <MessageSquareQuote className="w-4 h-4" />
            <span>Phrases & Chunks ({statsSummary.phrasesCount})</span>
          </button>

          <button
            onClick={() => onViewModeChange("FAMILIES")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
              viewMode === "FAMILIES"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20"
            }`}
          >
            <GitBranch className="w-4 h-4" />
            <span>Word Families ({familiesCount})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search word or phrase..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Category Chips (Greetings first, All Categories last) + Status & Sort Controls */}
      {viewMode !== "FAMILIES" && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: "GREETING", label: "👋 Greetings & Social" },
              { key: "PRONOUN", label: "👤 Pronouns" },
              { key: "VERB", label: "⚡ Verbs & Actions" },
              { key: "NOUN", label: "🏷️ Nouns" },
              { key: "ADJECTIVE", label: "🎨 Adjectives" },
              { key: "EXPRESSION", label: "💬 Expressions" },
              { key: "VOCABULARY", label: "🧱 Core Vocab" },
              { key: "ALL", label: "All Categories" },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => onCategoryChange(cat.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  categoryFilter === cat.key
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300 hover:text-slate-900"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl text-xs font-bold">
              {["ALL", "NEW", "LEARNING", "FAMILIAR", "MASTERED"].map((st) => (
                <button
                  key={st}
                  onClick={() => onStatusChange(st)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    statusFilter === st
                      ? "bg-slate-900 text-white dark:bg-slate-700"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortByOption)}
                className="bg-transparent focus:outline-none text-slate-700 dark:text-slate-200"
              >
                <option value="recent">Recently Seen</option>
                <option value="score">Pronunciation Score</option>
                <option value="mastery">Mastery Level</option>
                <option value="alpha">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </>
  );
}