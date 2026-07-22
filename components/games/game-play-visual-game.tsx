// components/games/GamePlayVisualGame.tsx
"use client";

import { useGameLoop } from "@/hooks/useGameLoop";
import GameShell from "./game-shell";
import VisualGame from "./types/visual-game"

export default function GamePlayVisualGame({ gameData }: { gameData: any }) {
  const { gameState, countdown, timeLeft, score, setScore, startGame, endGame } = useGameLoop(60, 3);

  return (
    <GameShell
      gameData={gameData}
      gameState={gameState}
      countdown={countdown}
      score={score}
      onStart={startGame}
    >
      <VisualGame
        gameData={gameData}
        timeLeft={timeLeft}
        score={score}
        setScore={setScore}
        onGameOver={endGame}
      />
    </GameShell>
  );
}