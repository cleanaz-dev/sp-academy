"use client";

import dynamic from "next/dynamic";
import React from "react";
import DetectiveCapybaraEngine from "./engines/detective-capybara-engine";

// Loading Fallback
const GameLoadingSkeleton = () => (
  <div className="flex h-96 animate-pulse flex-col items-center justify-center space-y-4">
    <div className="h-64 w-64 rounded-3xl bg-slate-200" />
    <div className="h-8 w-48 rounded-lg bg-slate-200" />
  </div>
);

// Dynamically import your game engines
const DuckAWearEngine = dynamic(
  () => import("@/components/games/engines/duck-a-wear-engine"),
  { loading: () => <GameLoadingSkeleton /> },
);

const PictureGameEngine = dynamic(
  () => import("@/components/games/engines/picture-game-engine"),
  { loading: () => <GameLoadingSkeleton /> },
);

interface GameEngineRegistryProps {
  gameTitle: string; // 🟢 FIX: Accept title instead of code
  gameData: any;
  targetLanguage: string;
  nativeLanguage: string;
  onGameOver: (finalScore: number) => void;
}

export function GameEngineRegistry({
  gameTitle,
  gameData,
  targetLanguage,
  nativeLanguage,
  onGameOver,
}: GameEngineRegistryProps) {
  // 🟢 FIX: Takes "Duck a Wear" or "Picture Game" and normalizes it to "DUCK_A_WEAR" or "PICTURE_GAME"
  const normalizedTitle = (gameTitle || "")
    .toUpperCase()
    .replace(/[-\s]+/g, "_");

  switch (normalizedTitle) {
    case "DUCK_A_WEAR":
    case "DUCK_WEAR":
      return (
        <DuckAWearEngine
          gameData={gameData}
          targetLanguage={targetLanguage}
          nativeLanguage={nativeLanguage}
          onGameOver={onGameOver}
        />
      );

    case "PICTURE_GAME":
      return (
        <PictureGameEngine
          gameData={gameData}
          targetLanguage={targetLanguage}
          nativeLanguage={nativeLanguage}
          onGameOver={onGameOver}
        />
      );

    case "DETECTIVE_CAPYBARA":
      return (
        <DetectiveCapybaraEngine
          gameData={gameData}
          targetLanguage={targetLanguage}
          nativeLanguage={nativeLanguage}
          onGameOver={onGameOver}
        />
      );

    default:
      return (
        <div className="flex h-96 flex-col items-center justify-center space-y-2 text-center">
          <h3 className="text-xl font-semibold text-slate-700">
            Unknown Game Engine
          </h3>
          <p className="text-slate-500">
            No component found for game title:{" "}
            <code className="rounded bg-slate-100 px-2 py-1 font-mono text-red-500">
              {gameTitle || "UNDEFINED"}
            </code>
          </p>
          <p className="mt-2 text-xs text-slate-400">
            (Evaluated as: {normalizedTitle})
          </p>
        </div>
      );
  }
}
