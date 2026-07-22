// app/admin/generate/games/create/page.tsx
"use client";

import React from "react";
import { GenerateProvider } from "@/context/generate-context"; // Adjust path to context
import GameForm from "@/components/games/game-form";
import GamePreviewPanel from "@/components/games/game-preview-panel";
import { Sparkles, Dice3 } from "lucide-react";

export default function Page() {
  return (
    <GenerateProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        {/* Header */}
        <header className="border-b bg-white dark:bg-slate-900 shadow-sm">
          <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <Dice3 className="h-7 w-7 text-blue-600" />
                Create New Game
                <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  <Sparkles className="inline-block h-3 w-3 mr-1" /> Multi-Language Studio
                </span>
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                Design your game structure, rules, language, and test live 1-frame previews!
              </p>
            </div>
          </div>
        </header>

        {/* Main Split-Screen Workspace */}
        <main className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Controls (5 Cols) */}
            <div className="lg:col-span-5">
              <GameForm />
            </div>

            {/* Right Column: Interactive Live Preview (7 Cols) */}
            <div className="lg:col-span-7 sticky top-8">
              <GamePreviewPanel />
            </div>
          </div>
        </main>
      </div>
    </GenerateProvider>
  );
}