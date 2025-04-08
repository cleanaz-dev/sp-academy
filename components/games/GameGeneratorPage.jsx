"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import GameForm from "./GameForm";
import GamePreviewComponent from "./GamePreviewComponent";

export function GameGeneratorPage() {
  const [gameData, setGameData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [slug, setSlug] = useState(null);

  const handleGeneratePreview = async (e, formData) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate/games/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log("preview response:", data);
      setGameData(data.game);
      setSlug(data.slug);
    } catch (error) {
      console.error("Error generating preview:", error);
      toast.error("Failed to generate preview");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveGame = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/generate/games/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameData }),
      });
      if (!response.ok) throw new Error("Failed to save game");
      toast.success("Game saved successfully!");
    } catch (error) {
      console.error("Error saving game:", error);
      toast.error("Failed to save game");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="text-center">
        <h1 className="text-3xl">Game Generator</h1>
        <p className="text-muted-foreground">
          Generate custom game ideas and previews
        </p>
      </header>

      {/* Game Form */}
      <GameForm
        handleGeneratePreview={handleGeneratePreview}
        isLoading={isLoading}
      />

      {/* Preview Section */}
      {gameData && (
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 text-lg font-semibold">Preview</h3>
          <GamePreviewComponent gameData={gameData} slug={slug} />
        </div>
      )}

      {/* Save Button */}
      {gameData && (
        <Button
          onClick={handleSaveGame}
          disabled={isSaving || isLoading}
          className="w-full"
        >
          {isSaving ? "Saving game..." : "Save Game"}
        </Button>
      )}
    </div>
  );
}
