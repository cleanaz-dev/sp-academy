"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSpeech } from "@/context/speech-context";
import { DuckAWearData } from "@/lib/schema/games/duck-a-wear-schema";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Mic, HelpCircle, Play, MicOff, Medal } from "lucide-react";
import { getDeepgramLanguageCode } from "@/lib/utils";

interface DuckAWearProps {
  gameData: DuckAWearData;
  targetLanguage?: string;
  nativeLanguage?: string;
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
  const [timeLeft, setTimeLeft] = useState(8); // Start higher to allow for speaking time
  const [gameState, setGameState] = useState<"ready" | "playing" | "ended">("ready");

  const roundData = gameData.rounds[currentRound];

  const startGame = async () => {
    setScore(0);
    setCurrentRound(0);
    setGameState("playing");
    const deepgramLang = getDeepgramLanguageCode(targetLanguage);
    await startRecording(deepgramLang);
  };

  useEffect(() => {
    if (gameState !== "playing") return;
    if (timeLeft === 0) {
      handleNextRound();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState]);

  const handleNextRound = useCallback(() => {
    resetSpeechState();
    if (currentRound + 1 >= gameData.rounds.length) {
      setGameState("ended");
      stopRecording();
      onGameOver(score + (timeLeft > 0 ? 1 : 0));
    } else {
      setCurrentRound((prev) => prev + 1);
      setTimeLeft(8);
    }
  }, [currentRound, gameData.rounds.length, score, timeLeft]);

  useEffect(() => {
    if (gameState !== "playing" || !transcript || !roundData) return;

    const lowerTranscript = transcript.toLowerCase();
    const hasColor = roundData.targetColors.some(color => lowerTranscript.includes(color.toLowerCase()));
    const hasClothing = roundData.targetClothes.some(clothing => lowerTranscript.includes(clothing.toLowerCase()));

    if (hasColor && hasClothing) {
      setScore((prev) => prev + 1);
      handleNextRound();
    }
  }, [transcript, gameState, roundData, handleNextRound]);

  // --- READY STATE ---
  if (gameState === "ready") {
    return (
      <div className="flex flex-col items-center justify-center flex-grow space-y-8 text-center h-full min-h-[400px]">
        <div className="bg-slate-100 p-6 rounded-full shadow-inner mb-4">
          <Mic className="h-16 w-16 text-blue-500" />
        </div>
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">{gameData.gameTitle}</h2>
          <p className="text-lg text-slate-500 max-w-sm mx-auto leading-relaxed">
            Look at the duck and say what it is wearing in <strong className="text-blue-600">{targetLanguage}</strong>!
          </p>
        </div>
        <Button 
          onClick={startGame} 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-10 py-8 text-xl font-bold shadow-xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          <Play className="h-6 w-6 fill-current" />
          Start Game
        </Button>
      </div>
    );
  }

  // --- ENDED STATE ---
  if (gameState === "ended") {
    return (
      <div className="flex flex-col items-center justify-center flex-grow space-y-6 h-full min-h-[400px] animate-in zoom-in duration-300">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-20 rounded-full" />
          <Medal className="h-24 w-24 text-amber-500 drop-shadow-xl relative z-10" />
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900">Game Over!</h2>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 px-12 flex flex-col items-center shadow-sm">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Final Score</span>
          <span className="text-5xl font-black text-amber-500">{score}</span>
        </div>
      </div>
    );
  }

  // --- PLAYING STATE ---
  return (
    <div className="flex flex-col flex-grow h-full max-w-md mx-auto w-full">
      
      {/* Top Bar: Progress, Score & Timer */}
      <div className="flex justify-between items-center w-full mb-8">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl font-bold shadow-sm">
          <Trophy className="h-5 w-5 text-amber-500" /> 
          <span className="text-lg">{score}</span>
        </div>
        
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
          Round {currentRound + 1} / {gameData.rounds.length}
        </div>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold shadow-sm transition-colors duration-300 ${
          timeLeft <= 3 ? "bg-red-50 border border-red-200 text-red-600 animate-pulse" : "bg-slate-50 border border-slate-200 text-slate-700"
        }`}>
          <Timer className="h-5 w-5" /> 
          <span className="text-lg">{timeLeft}s</span>
        </div>
      </div>

      {/* Main Image View */}
      <div className="flex-grow flex flex-col justify-center items-center relative mb-8">
        <div className="w-full aspect-square max-w-[320px] bg-slate-100 rounded-[2rem] shadow-lg overflow-hidden border-8 border-white relative z-10">
          {roundData?.imageUrl ? (
            <img 
              src={roundData.imageUrl} 
              alt="Duck wearing clothes" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">Loading...</div>
          )}
        </div>
      </div>

      {/* Helper / Native Hint Banner */}
      <div className="bg-blue-50/80 border border-blue-200/60 rounded-2xl p-4 flex items-start gap-3 mb-6">
        <HelpCircle className="h-5 w-5 shrink-0 text-blue-500 mt-0.5" />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Translate to {targetLanguage}</span>
          <span className="text-blue-900 font-medium">
            "{roundData?.nativeColors.join(", ")} {roundData?.nativeClothes.join(", ")}"
          </span>
        </div>
      </div>

      {/* Speech Status Bar */}
      <div className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
        
        {/* Animated Mic Button */}
        <div className={`relative flex shrink-0 items-center justify-center w-14 h-14 rounded-full transition-all ${
          isRecording ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-slate-200 text-slate-400"
        }`}>
          {isRecording && (
            <div className="absolute inset-0 border-[3px] border-blue-400 rounded-full animate-ping opacity-75" />
          )}
          {isRecording ? <Mic className="h-6 w-6 relative z-10" /> : <MicOff className="h-6 w-6 relative z-10" />}
        </div>
        
        {/* Live Transcript text */}
        <div className="flex-grow min-h-[2.5rem] flex items-center">
          {transcript ? (
            <span className="text-slate-800 font-medium text-lg leading-tight">"{transcript}"</span>
          ) : (
            <span className="text-slate-400 italic">Listening... Speak now</span>
          )}
        </div>
      </div>

    </div>
  );
}