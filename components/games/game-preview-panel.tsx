"use client";

import React from "react";
import { useGenerate } from "@/context/generate-context"; // Adjust path to context
import { SpeechProvider } from "@/context/speech-context"; // Speech Provider for voice testing
import ImageDescribeGame from "./types/image-describe-game";
import VisualGame from "./types/visual-game";
import { Card } from "@/components/ui/card";
import { Sparkles, AlertCircle, Eye, Loader2 } from "lucide-react";

export default function GamePreviewPanel() {
  const { form, previewData, isPreviewLoading, previewError, isGenerating, generationStatus } =
    useGenerate();

  // Helper to format the single preview sample into a mock `Game` payload
  const mockGamePayload = previewData
    ? {
        id: "preview-id",
        title: form.title || "Preview Title",
        description: form.description || "Preview Description",
        type: form.type,
        language: form.language,
        gameData: [previewData], // Wrap the single sample into an array of 1 item
        GameSoundEffects: [],
      }
    : null;

  return (
    <div className="flex flex-col h-full rounded-xl border bg-slate-50 p-6 shadow-sm dark:bg-slate-900/50">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Live Interactive Preview
          </h2>
        </div>
        {previewData && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Ready to Test
          </span>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-[500px]">
        {/* State 1: Loading Preview */}
        {isPreviewLoading && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center p-8">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Generating Sample Frame...</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Creating sample image for "{form.theme || "Topic"}" in {form.imageStyle} style...
              </p>
            </div>
          </div>
        )}

        {/* State 2: Error State */}
        {previewError && !isPreviewLoading && (
          <div className="flex flex-col items-center justify-center space-y-2 text-center text-red-500 p-8">
            <AlertCircle className="h-10 w-10" />
            <h3 className="text-lg font-semibold">Preview Error</h3>
            <p className="text-sm max-w-sm">{previewError}</p>
          </div>
        )}

        {/* State 3: Empty Placeholder (No preview generated yet) */}
        {!previewData && !isPreviewLoading && !previewError && (
          <div className="flex flex-col items-center justify-center space-y-3 text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl w-full h-full">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4">
              <Sparkles className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">
              No Preview Generated Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Fill in the game details on the left and click "Generate 1-Frame Preview" to test the UI.
            </p>
          </div>
        )}

        {/* State 4: Active Interactive Game Preview */}
        {previewData && !isPreviewLoading && mockGamePayload && (
          <div className="w-full h-full flex flex-col">
            {/* Context Badge Info */}
            <div className="mb-3 flex flex-wrap gap-2 text-xs">
              <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-medium">
                Engine: {form.type}
              </span>
              <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded font-medium">
                Language: {form.language}
              </span>
              <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded font-medium">
                Style: {form.imageStyle}
              </span>
            </div>

            {/* Interactive Component House */}
            <div className="flex-1 border rounded-lg overflow-hidden bg-white dark:bg-slate-900 p-2 shadow-inner">
              <SpeechProvider>
                {form.type === "SPEECH_DESCRIBE" && (
                  <ImageDescribeGame
                    gameData={mockGamePayload}
                    score={0}
                    setScore={() => {}}
                    onGameOver={() => alert("Preview turn completed!")}
                  />
                )}

                {form.type === "VISUAL" && (
                  <VisualGame
                    gameData={mockGamePayload}
                    score={0}
                    setScore={() => {}}
                    onGameOver={() => alert("Preview turn completed!")}
                  />
                )}
              </SpeechProvider>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar for Generation Queue */}
      {isGenerating && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-950 dark:border-blue-900 flex items-center justify-between text-xs text-blue-800 dark:text-blue-200">
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            Background Task Status: <strong>{generationStatus}</strong>
          </span>
          <span>AWS Lambda Active...</span>
        </div>
      )}
    </div>
  );
}