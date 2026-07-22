// hooks/useGameLoop.ts
import { useState, useEffect } from "react";

export function useGameLoop(initialTime = 60, initialCountdown = 3) {
  const [gameState, setGameState] = useState<"idle" | "countdown" | "playing" | "gameover">("idle");
  const [countdown, setCountdown] = useState(initialCountdown);
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [score, setScore] = useState(0);

  const startGame = () => {
    setScore(0);
    setCountdown(initialCountdown);
    setTimeLeft(initialTime);
    setGameState("countdown");
  };

  // Countdown timer logic
  useEffect(() => {
    if (gameState !== "countdown") return;
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setGameState("playing");
    }
  }, [gameState, countdown]);

  // Main game timer logic
  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    } else {
      setGameState("gameover");
    }
  }, [gameState, timeLeft]);

  return {
    gameState,
    countdown,
    timeLeft,
    score,
    setScore,
    startGame,
    endGame: () => setGameState("gameover"),
  };
}