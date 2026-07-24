"use client";

import React from "react";
import { GameEngineRegistry } from "./game-registry";
import { saveGameScore } from "@/lib/actions"; // Your server action to record score

interface GameRunnerProps {
  gameVariation: any; // Prisma GameVariation with included Game model
}

export function GameRunner({ gameVariation }: GameRunnerProps) {
  const { game, gameData, targetLanguage, nativeLanguage, id: variationId } = gameVariation;

  const handleGameOver = async (finalScore: number) => {
    console.log("Game Over! Final score:", finalScore);
    
    try {
      // Call your server action to persist score in GameScore table
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
        gameCode={game.code || "DUCK_A_WEAR"}
        gameData={gameData}
        targetLanguage={targetLanguage}
        nativeLanguage={nativeLanguage}
        onGameOver={handleGameOver}
      />
    </div>
  );
}