"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSpeech } from "@/context/speech-context"; // Adjust path
import { DuckAWearData } from "@/lib/schema/games/duck-a-wear-schema";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Mic } from "lucide-react";

interface DuckAWearProps {
  gameData: DuckAWearData;
  onGameOver: (finalScore: number) => void;
}

export default function DuckAWearEngine({ gameData, onGameOver }: DuckAWearProps) {
  const { 
    isRecording, 
    transcript, 
    startRecording, 
    stopRecording, 
    resetSpeechState 
  } = useSpeech();

  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);
  const [gameState, setGameState] = useState<"ready" | "playing" | "ended">("ready");

  const roundData = gameData.rounds[currentRound];

  // --------------------------------------------------------
  // 1. Start the Game & Microphone
  // --------------------------------------------------------
  const startGame = async () => {
    setScore(0);
    setCurrentRound(0);
    setGameState("playing");
    await startRecording();
  };

  // --------------------------------------------------------
  // 2. The 3-Second Timer Logic
  // --------------------------------------------------------
  useEffect(() => {
    if (gameState !== "playing") return;

    if (timeLeft === 0) {
      handleNextRound(); // Time ran out! Move to next.
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  // --------------------------------------------------------
  // 3. REAL-TIME SCORING LOGIC
  // --------------------------------------------------------
  useEffect(() => {
    if (gameState !== "playing" || !transcript || !roundData) return;

    const lowerTranscript = transcript.toLowerCase();

    // Check if the spoken text contains AT LEAST ONE valid color
    const hasColor = roundData.targetColors.some(color => 
      lowerTranscript.includes(color.toLowerCase())
    );

    // Check if the spoken text contains AT LEAST ONE valid clothing item
    const hasClothing = roundData.targetClothes.some(clothing => 
      lowerTranscript.includes(clothing.toLowerCase())
    );

    // If both match in real-time -> INSTANT WIN!
    if (hasColor && hasClothing) {
      handleCorrectAnswer();
    }
  }, [transcript, gameState, roundData]);

  // --------------------------------------------------------
  // 4. Handle Round Transitions
  // --------------------------------------------------------
  const handleCorrectAnswer = useCallback(() => {
    // Optional: Play a "DING!" sound here
    setScore((prev) => prev + 1);
    handleNextRound();
  }, [currentRound]);

  const handleNextRound = useCallback(() => {
    resetSpeechState(); // Clear the Deepgram transcript for the new round
    
    if (currentRound + 1 >= gameData.rounds.length) {
      // Game Over
      setGameState("ended");
      stopRecording();
      onGameOver(score + (timeLeft > 0 ? 1 : 0)); // Pass final score up
    } else {
      // Next Round
      setCurrentRound((prev) => prev + 1);
      setTimeLeft(3); // Reset timer to 3 seconds
    }
  }, [currentRound, gameData.rounds.length, score, timeLeft]);


  // --------------------------------------------------------
  // 5. Render UI
  // --------------------------------------------------------
  if (gameState === "ready") {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <h2 className="text-3xl font-bold">{gameData.gameTitle}</h2>
        <p className="text-slate-500">You have 3 seconds per duck to say what they are wearing!</p>
        <Button onClick={startGame} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg">
          Start Game
        </Button>
      </div>
    );
  }

  if (gameState === "ended") {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <h2 className="text-3xl font-bold">Game Over!</h2>
        <p className="text-xl flex items-center gap-2"><Trophy className="text-amber-500"/> Score: {score}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 max-w-2xl mx-auto">
      
      {/* Header Info */}
      <div className="flex justify-between w-full items-center">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Trophy className="text-amber-500 h-6 w-6" /> {score}
        </div>
        <div className={`flex items-center gap-2 text-2xl font-bold ${timeLeft <= 1 ? "text-red-500 animate-pulse" : "text-slate-700"}`}>
          <Timer className="h-6 w-6" /> {timeLeft}s
        </div>
      </div>

      {/* The Duck Image */}
      <div className="relative w-64 h-64 bg-slate-100 rounded-3xl shadow-xl overflow-hidden border-4 border-white">
        <img 
          src={roundData.imageUrl} 
          alt="Duck wearing clothes" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Microphone Status & Real-time Transcript */}
      <div className="flex flex-col items-center gap-3 w-full">
        <div className={`p-4 rounded-full ${isRecording ? "bg-red-100 text-red-500 animate-pulse" : "bg-slate-100 text-slate-400"}`}>
          <Mic className="h-8 w-8" />
        </div>
        
        <div className="min-h-[60px] w-full bg-slate-50 border rounded-xl p-4 flex items-center justify-center text-center italic text-slate-600">
          {transcript || "Listening..."}
        </div>
      </div>

    </div>
  );
}