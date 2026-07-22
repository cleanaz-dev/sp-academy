// components/admin/game-preview-panel.tsx
"use client";

import React from "react";
import { useGenerate } from "@/context/generate-context";
import { Sparkles, Eye, Loader2, CheckCircle2 } from "lucide-react";

export default function GamePreviewPanel() {
  const { form, previewData, isPreviewLoading, previewError, isGenerating, generationStatus } =
    useGenerate();

  return (
    <div className="flex flex-col h-full rounded-xl border bg-slate-50 p-6 shadow-sm dark:bg-slate-900/50">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            1-Frame Sample Preview
          </h2>
        </div>
        {previewData && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Generated Successfully
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-center items-center min-h-[450px]">
        {/* State 1: Loading */}
        {isPreviewLoading && (
          <div className="flex flex-col items-center justify-center space-y-4 text-center p-8">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold">Calling Novita AI...</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Generating image & LLM payload for "{form.theme}"...
              </p>
            </div>
          </div>
        )}

        {/* State 2: Empty Placeholder */}
        {!previewData && !isPreviewLoading && (
          <div className="flex flex-col items-center justify-center space-y-3 text-center p-8 border-2 border-dashed border-slate-200 rounded-xl w-full h-full">
            <Sparkles className="h-8 w-8 text-slate-400" />
            <h3 className="text-base font-semibold text-slate-700">No Preview Generated Yet</h3>
            <p className="text-xs text-slate-500 max-w-xs">
              Fill in the form on the left and click "Generate 1-Frame Preview".
            </p>
          </div>
        )}

        {/* State 3: Clean Preview Display Card */}
        {previewData && !isPreviewLoading && (
          <div className="w-full space-y-4 bg-white p-5 rounded-xl border shadow-sm dark:bg-slate-900">
            {/* Context Tags */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded font-medium">
                Engine: {form.type}
              </span>
              <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded font-medium">
                Lang: {form.language}
              </span>
              <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded font-medium">
                Style: {form.imageStyle}
              </span>
            </div>

            {/* Generated AI Image */}
            <div className="relative w-full overflow-hidden rounded-lg border bg-slate-100">
              <img
                src={previewData.imageUrl}
                alt="AI Generated Prompt"
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* Content Payload Output based on Game Type */}
            {form.type === "SPEECH_DESCRIBE" && (
              <div className="space-y-3 border-t pt-3">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase">Target Description ({form.language}):</p>
                  <p className="text-sm font-medium italic text-slate-800 dark:text-slate-200">
                    "{previewData.description}"
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Keywords to Listen For:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {previewData.targetKeywords?.map((keyword: string, i: number) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"
                      >
                        <CheckCircle2 className="h-3 w-3" /> {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {form.type === "VISUAL" && (
              <div className="space-y-3 border-t pt-3">
                <p className="text-xs font-semibold text-slate-500 uppercase">Answer Choices:</p>
                <div className="grid grid-cols-2 gap-2">
                  {previewData.choices?.map((choice: string, i: number) => (
                    <div
                      key={i}
                      className={`p-2.5 text-center text-sm rounded-lg border font-medium ${
                        choice === previewData.answer
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold"
                          : "bg-slate-50 text-slate-700"
                      }`}
                    >
                      {choice} {choice === previewData.answer && "✓"}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}