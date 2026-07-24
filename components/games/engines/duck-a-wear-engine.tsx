"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSpeech } from "@/context/speech-context";
import { DuckAWearData } from "@/lib/schema/games/duck-a-wear-schema";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Mic, HelpCircle } from "lucide-react";
import { getDeepgramLanguageCode } from "@/lib/utils";

interface DuckAWearProps {
  gameData: DuckAWearData;
  targetLanguage?: string; // e.g. "SPANISH", "FRENCH"
  nativeLanguage?: string; // e.g. "ENGLISH"
  onGameOver: (finalScore: number) => void;
}

export default function DuckAWearEngine({ 
  gameData, 
  targetLanguage = "ENGLISH",
  nativeLanguage = "FRENCH",
  onGameOver 
}: DuckAWearProps) {
  const { 
    isRecording, 
    transcript, 
    startRecording, 
    stopRecording, 
    resetSpeechState 
  } = useSpeech();

  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5); // Increased slightly for speech recognition
  const [gameState, setGameState] = useState<"ready" | "playing" | "ended">("ready");

  const roundData = gameData.rounds[currentRound];

  // 1. Start Game
  const startGame = async () => {
    setScore(0);
    setCurrentRound(0);
    setGameState("playing");
    const deepgramLang = getDeepgramLanguageCode(targetLanguage);

    await startRecording(deepgramLang);
  };

  // 2. Timer Logic
  useEffect(() => {
    if (gameState !== "playing") return;

    if (timeLeft === 0) {
      handleNextRound();
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  // 3. Match Spoken Target Words
  useEffect(() => {
    if (gameState !== "playing" || !transcript || !roundData) return;

    const lowerTranscript = transcript.toLowerCase();

    // Check against TARGET language words
    const hasColor = roundData.targetColors.some(color => 
      lowerTranscript.includes(color.toLowerCase())
    );

    const hasClothing = roundData.targetClothes.some(clothing => 
      lowerTranscript.includes(clothing.toLowerCase())
    );

    if (hasColor && hasClothing) {
      handleCorrectAnswer();
    }
  }, [transcript, gameState, roundData]);

  const handleCorrectAnswer = useCallback(() => {
    setScore((prev) => prev + 1);
    handleNextRound();
  }, [currentRound]);

  const handleNextRound = useCallback(() => {
    resetSpeechState();
    
    if (currentRound + 1 >= gameData.rounds.length) {
      setGameState("ended");
      stopRecording();
      onGameOver(score + (timeLeft > 0 ? 1 : 0));
    } else {
      setCurrentRound((prev) => prev + 1);
      setTimeLeft(5);
    }
  }, [currentRound, gameData.rounds.length, score, timeLeft]);

  if (gameState === "ready") {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <h2 className="text-3xl font-bold">{gameData.gameTitle}</h2>
        <p className="text-slate-500">
          Say what the duck is wearing in <strong>{targetLanguage}</strong>!
        </p>
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
        <p className="text-xl flex items-center gap-2">
          <Trophy className="text-amber-500"/> Score: {score}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 max-w-2xl mx-auto">
      
      {/* Header Info */}
      <div className="flex justify-between w-full items-center">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Trophy className="text-amber-500 h-6 w-6" /> {score}
        </div>
        <div className={`flex items-center gap-2 text-2xl font-bold ${timeLeft <= 2 ? "text-red-500 animate-pulse" : "text-slate-700"}`}>
          <Timer className="h-6 w-6" /> {timeLeft}s
        </div>
      </div>

      {/* Duck Image */}
      <div className="relative w-64 h-64 bg-slate-100 rounded-3xl shadow-xl overflow-hidden border-4 border-white">
        {roundData.imageUrl && (
          <img 
            src={roundData.imageUrl} 
            alt="Duck wearing clothes" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Native Language Hint Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2 text-blue-800 text-sm">
        <HelpCircle className="h-5 w-5 shrink-0 text-blue-600" />
        <span>
          Hint ({nativeLanguage}): <strong>{roundData.nativeColors.join(", ")}</strong> + <strong>{roundData.nativeClothes.join(", ")}</strong>
        </span>
      </div>

      {/* Speech Status & Transcript */}
      <div className="flex flex-col items-center gap-3 w-full">
        <div className={`p-4 rounded-full ${isRecording ? "bg-red-100 text-red-500 animate-pulse" : "bg-slate-100 text-slate-400"}`}>
          <Mic className="h-8 w-8" />
        </div>
        
        <div className="min-h-[60px] w-full bg-slate-50 border rounded-xl p-4 flex items-center justify-center text-center italic text-slate-600">
          {transcript || `Listening in ${targetLanguage}...`}
        </div>
      </div>

    </div>
  );
}