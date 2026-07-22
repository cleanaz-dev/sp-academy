"use client";

import React from "react";
import { useGenerate, GameType, LanguageCode } from "@/context/generate-context"; // Adjust path to context
import { Button } from "@/components/ui/button"; // Adjust path to your UI components if using Shadcn
import { Sparkles, Play, RefreshCw, Layers } from "lucide-react";

export default function GameForm() {
  const {
    form,
    updateFormField,
    previewData,
    isPreviewLoading,
    fetchPreview,
    isGenerating,
    generationStatus,
    triggerFullGeneration,
    resetState,
  } = useGenerate();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPreview();
  };

  return (
    <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm dark:bg-slate-900">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Game Configuration
          </h2>
          <p className="text-xs text-slate-500">
            Define target language, theme, and game mechanics.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={resetState} type="button">
          <RefreshCw className="mr-1 h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5">
        {/* 1. Game Title & Description */}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Game Title
            </label>
            <input
              type="text"
              placeholder='e.g., "Fast Spanish Farm Animals"'
              value={form.title}
              onChange={(e) => updateFormField("title", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Description (Optional)
            </label>
            <textarea
              placeholder="Brief summary for players..."
              value={form.description}
              onChange={(e) => updateFormField("description", e.target.value)}
              rows={2}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* 2. Game Engine Type & Language */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Game Type / Engine
            </label>
            <select
              value={form.type}
              onChange={(e) => updateFormField("type", e.target.value as GameType)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
            >
              <option value="SPEECH_DESCRIBE">🎤 Speech Describe (Voice)</option>
              <option value="VISUAL">🖼️ Visual Quiz (Multiple Choice)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Target Language
            </label>
            <select
              value={form.language}
              onChange={(e) => updateFormField("language", e.target.value as LanguageCode)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
            >
              <option value="en-US">🇺🇸 English (en-US)</option>
              <option value="fr-FR">🇫🇷 French (fr-FR)</option>
              <option value="es-ES">🇪🇸 Spanish (es-ES)</option>
            </select>
          </div>
        </div>

        {/* 3. Theme / Topic Prompt */}
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Topic / Theme Prompt
          </label>
          <input
            type="text"
            placeholder='e.g., "Safari Animals", "Kitchen Objects", "Space Travel"'
            value={form.theme}
            onChange={(e) => updateFormField("theme", e.target.value)}
            className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            This theme instructs the AI on what images and keywords to produce.
          </p>
        </div>

        {/* 4. Image Style & Difficulty */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Visual Image Style
            </label>
            <select
              value={form.imageStyle}
              onChange={(e) => updateFormField("imageStyle", e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
            >
              <option value="3D Cartoon">🎨 3D Cartoon (Pixar Style)</option>
              <option value="Photorealistic">📸 Photorealistic</option>
              <option value="Watercolor">🖌️ Watercolor Illustration</option>
              <option value="Pixel Art">👾 Pixel Art</option>
              <option value="Anime">⛩️ Anime / Manga</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Difficulty & Item Count
            </label>
            <div className="flex gap-2">
              <select
                value={form.difficulty}
                onChange={(e) => updateFormField("difficulty", Number(e.target.value))}
                className="w-1/2 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
              >
                <option value={1}>Easy (Level 1)</option>
                <option value={2}>Medium (Level 2)</option>
                <option value={3}>Hard (Level 3)</option>
              </select>

              <select
                value={form.itemCount}
                onChange={(e) => updateFormField("itemCount", Number(e.target.value))}
                className="w-1/2 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 space-y-3">
          {/* Button 1: Preview */}
          <Button
            type="submit"
            variant="outline"
            disabled={isPreviewLoading || !form.theme.trim()}
            className="w-full border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800"
          >
            {isPreviewLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating 1-Frame Preview...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4 text-blue-500" /> Generate 1-Frame Preview
              </>
            )}
          </Button>

          {/* Button 2: Trigger Full Generation */}
          <Button
            type="button"
            onClick={triggerFullGeneration}
            disabled={!previewData || isGenerating || !form.title.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Triggering Lambda Job... ({generationStatus})
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4 fill-white" /> Confirm & Launch Full Game Generation
              </>
            )}
          </Button>

          {!previewData && (
            <p className="text-center text-xs text-amber-600 dark:text-amber-400">
              ⚠️ You must generate and test a preview frame before launching full generation.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}