"use client";

import dynamic from "next/dynamic";
import React from "react";

// Loading Fallback
const GameLoadingSkeleton = () => (
  <div className="flex h-96 animate-pulse flex-col items-center justify-center space-y-4">
    <div className="h-64 w-64 rounded-3xl bg-slate-200" />
    <div className="h-8 w-48 rounded-lg bg-slate-200" />
  </div>
);

// 1. Dynamically import your game engines (Code Splitting)
const DuckAWearEngine = dynamic(
  () => import("@/components/games/engines/duck-a-wear-engine"),
  { loading: () => <GameLoadingSkeleton /> },
);

// Add future game engines here as you create them:
const PictureGameEngine = dynamic(
  () => import("@/components/games/engines/picture-game-engine"),
  { loading: () => <GameLoadingSkeleton /> },
);
// const FlashcardsEngine = dynamic(() => import("@/components/games/flashcards/flashcards-engine"), { loading: () => <GameLoadingSkeleton /> });

interface GameEngineRegistryProps {
  gameCode: string;
  gameData: any;
  targetLanguage: string;
  nativeLanguage: string;
  onGameOver: (finalScore: number) => void;
}

export function GameEngineRegistry({
  gameCode,
  gameData,
  targetLanguage,
  nativeLanguage,
  onGameOver,
}: GameEngineRegistryProps) {
  // Normalize the code to handle lowercase or uppercase variations
  const normalizedCode = gameCode.toUpperCase().replace(/-/g, "_");

  switch (normalizedCode) {
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
    //   return <WordMatchEngine gameData={gameData} ... />;

    default:
      return (
        <div className="flex h-96 flex-col items-center justify-center space-y-2 text-center">
          <h3 className="text-xl font-semibold text-slate-700">
            Unknown Game Engine
          </h3>
          <p className="text-slate-500">
            No component found for game code:{" "}
            <code className="rounded bg-slate-100 px-2 py-1 text-red-500">
              {gameCode}
            </code>
          </p>
        </div>
      );
  }
}
