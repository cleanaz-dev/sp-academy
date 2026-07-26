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
    <div className="w-full max-w-3xl mx-auto flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      {/* Glossy White Game Container */}
      <div className="w-full bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-6 md:p-10 relative overflow-hidden min-h-[600px] flex flex-col transition-all">
        
        {/* Subtle decorative glow inside the card */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative z-10 flex-grow flex flex-col">
          <GameEngineRegistry
            gameTitle={game.title}
            gameData={gameData}
            targetLanguage={targetLanguage}
            nativeLanguage={nativeLanguage}
            onGameOver={handleGameOver}
          />
        </div>
      </div>
    </div>
  );
}