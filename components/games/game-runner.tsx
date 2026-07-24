"use client";

import React from "react";
import { GameEngineRegistry } from "./game-registry";
import { saveGameScore } from "@/lib/actions";

interface GameRunnerProps {
  gameVariation: any; 
}

export function GameRunner({ gameVariation }: GameRunnerProps) {
  const { game, gameData, targetLanguage, nativeLanguage, id: variationId } = gameVariation;

  const handleGameOver = async (finalScore: number) => {
    console.log("Game Over! Final score:", finalScore);
    
    try {
      await saveGameScore({
        gameId: game.id,
        variationId,
        score: finalScore,
      });
    } catch (err) {
      console.error("Failed to save score:", err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <GameEngineRegistry
        gameTitle={game.title} // 🟢 FIX: Use the actual TITLE of the game!
        gameData={gameData}
        targetLanguage={targetLanguage}
        nativeLanguage={nativeLanguage}
        onGameOver={handleGameOver}
      />
    </div>
  );
}