"use client";

import dynamic from "next/dynamic";
import React from "react";

// Loading Fallback
const GameLoadingSkeleton = () => (
  <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-pulse">
    <div className="w-64 h-64 bg-slate-200 rounded-3xl" />
    <div className="w-48 h-8 bg-slate-200 rounded-lg" />
  </div>
);

// 1. Dynamically import your game engines (Code Splitting)
const DuckAWearEngine = dynamic(
  () => import("@/components/games/engines/duck-a-wear-engine"),
  { loading: () => <GameLoadingSkeleton /> }
);

// Add future game engines here as you create them:
// const WordMatchEngine = dynamic(() => import("@/components/games/word-match/word-match-engine"), { loading: () => <GameLoadingSkeleton /> });
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

    // case "WORD_MATCH":
    //   return <WordMatchEngine gameData={gameData} ... />;

    default:
      return (
        <div className="flex flex-col items-center justify-center h-96 space-y-2 text-center">
          <h3 className="text-xl font-semibold text-slate-700">Unknown Game Engine</h3>
          <p className="text-slate-500">
            No component found for game code: <code className="bg-slate-100 px-2 py-1 rounded text-red-500">{gameCode}</code>
          </p>
        </div>
      );
  }
}