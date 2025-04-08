// components/games/GamePreviewComponent.jsx
"use client";

import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import templates from "@/lib/game-templates"; // Import your game templates

export default function GamePreviewComponent({ slug, gameData }) {
  // Find the template based on the gameSlug
  const template = templates.find((template) => template.slug === slug);

  if (!template) {
    return <div>No template found for {slug}</div>;
  }

  // Get the preview component from the template
  const PreviewComponent = template.previewComponent;

  if (!PreviewComponent) {
    return <div>No preview component found for {slug}</div>;
  }

  return (
    <ErrorBoundary fallback={<div>Error loading preview</div>}>
      <div className="preview-container">
        <PreviewComponent gameData={gameData} />
      </div>
    </ErrorBoundary>
  );
}
