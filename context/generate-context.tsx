"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

export type GameType = "VISUAL" | "SPEECH_DESCRIBE";
export type LanguageCode = "en-US" | "fr-FR" | "es-ES";

export interface GameFormState {
  title: string;
  description: string;
  type: GameType;
  language: LanguageCode;
  theme: string;
  difficulty: number;
  imageStyle: string;
  itemCount: number;
}

export interface GenerateContextType {
  // Form State
  form: GameFormState;
  updateFormField: <K extends keyof GameFormState>(field: K, value: GameFormState[K]) => void;
  
  // Preview State
  previewData: any | null;
  isPreviewLoading: boolean;
  previewError: string | null;
  fetchPreview: () => Promise<void>;
  
  // Full Generation State
  taskId: string | null;
  isGenerating: boolean;
  generationStatus: "IDLE" | "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED";
  generationError: string | null;
  triggerFullGeneration: () => Promise<void>;
  
  // Reset
  resetState: () => void;
}

const initialFormState: GameFormState = {
  title: "",
  description: "",
  type: "SPEECH_DESCRIBE",
  language: "en-US",
  theme: "",
  difficulty: 1,
  imageStyle: "3D Cartoon",
  itemCount: 10,
};

const GenerateContext = createContext<GenerateContextType | undefined>(undefined);

export function GenerateProvider({ children }: { children: ReactNode }) {
  // 1. Form State
  const [form, setForm] = useState<GameFormState>(initialFormState);

  // 2. Preview State
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // 3. Full Generation State
  const [taskId, setTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<
    "IDLE" | "QUEUED" | "RUNNING" | "COMPLETED" | "FAILED"
  >("IDLE");
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Helper to update a single form field
  const updateFormField = <K extends keyof GameFormState>(
    field: K,
    value: GameFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear preview when critical settings change so admin is forced to re-preview
    if (["type", "language", "theme", "imageStyle"].includes(field)) {
      setPreviewData(null);
    }
  };

  // Action: Call fast 1-frame preview API
  const fetchPreview = async () => {
    if (!form.theme.trim()) {
      toast.error("Please enter a topic or theme before previewing.");
      return;
    }

    setIsPreviewLoading(true);
    setPreviewError(null);

    try {
      const response = await fetch("/api/admin/games/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          language: form.language,
          theme: form.theme,
          imageStyle: form.imageStyle,
          difficulty: form.difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate preview.");
      }

      setPreviewData(data.previewSample);
      toast.success("1-Frame preview generated!");
    } catch (err: any) {
      console.error("Preview error:", err);
      setPreviewError(err.message || "Something went wrong.");
      toast.error(err.message || "Failed to generate preview.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Action: Trigger AWS Lambda & Background Task
  const triggerFullGeneration = async () => {
    if (!previewData) {
      toast.error("Please generate and approve a preview first.");
      return;
    }

    if (!form.title.trim()) {
      toast.error("Please provide a title for the game.");
      return;
    }

    setIsGenerating(true);
    setGenerationStatus("QUEUED");
    setGenerationError(null);

    try {
      const response = await fetch("/api/admin/games/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          previewSample: previewData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to start generation job.");
      }

      setTaskId(data.taskId);
      setGenerationStatus("RUNNING");
      toast.success("Full game generation task queued!");
    } catch (err: any) {
      console.error("Generation trigger error:", err);
      setGenerationStatus("FAILED");
      setGenerationError(err.message || "Failed to trigger generation.");
      toast.error(err.message || "Failed to trigger generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset entire state
  const resetState = () => {
    setForm(initialFormState);
    setPreviewData(null);
    setIsPreviewLoading(false);
    setPreviewError(null);
    setTaskId(null);
    setIsGenerating(false);
    setGenerationStatus("IDLE");
    setGenerationError(null);
  };

  return (
    <GenerateContext.Provider
      value={{
        form,
        updateFormField,
        previewData,
        isPreviewLoading,
        previewError,
        fetchPreview,
        taskId,
        isGenerating,
        generationStatus,
        generationError,
        triggerFullGeneration,
        resetState,
      }}
    >
      {children}
    </GenerateContext.Provider>
  );
}

export function useGenerate() {
  const context = useContext(GenerateContext);
  if (!context) {
    throw new Error("useGenerate must be used within a GenerateProvider");
  }
  return context;
}