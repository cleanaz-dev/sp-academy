// components/games/GameShell.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import { toast } from "sonner";

export default function GameShell({
  gameData,
  gameState,
  countdown,
  score,
  onStart,
  children,
}: {
  gameData: any;
  gameState: "idle" | "countdown" | "playing" | "gameover";
  countdown: number;
  score: number;
  onStart: () => void;
  children: React.ReactNode; // The unique gameplay goes here!
}) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitScore = async () => {
    if (!gameData?.id) return toast.error("Game ID missing");
    setSubmitting(true);
    try {
      const res = await fetch("/api/games/submit-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: gameData.id, score }),
      });
      if (!res.ok) throw new Error("Failed to submit score");
      toast.success("Score submitted successfully!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (gameState === "idle") {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold">{gameData?.title || "Game Title"}</h1>
        <p className="text-xl">{gameData?.description}</p>
        <Button onClick={onStart}>Start Game</Button>
      </div>
    );
  }

  if (gameState === "countdown") {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-6xl font-bold">{countdown}</h1>
        <p className="text-xl">Get ready!</p>
      </div>
    );
  }

  if (gameState === "gameover") {
    return (
      <div className="flex h-screen flex-col items-center justify-center space-y-4">
        <h1 className="text-4xl font-bold">Game Over!</h1>
        <p className="text-2xl">Your Score: {score}</p>
        <Button onClick={onStart}>Play Again</Button>
        <Button onClick={handleSubmitScore} className="bg-amber-400">
          <Crown className="mr-2" /> {submitting ? "Submitting..." : "Submit Score"}
        </Button>
      </div>
    );
  }

  // Active Gameplay UI rendered here
  return <>{children}</>;
}