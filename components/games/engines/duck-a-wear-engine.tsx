"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSpeech } from "@/context/speech-context";
import { DuckAWearData } from "@/lib/schema/games/duck-a-wear-schema";
import { Button } from "@/components/ui/button";
import { Timer, Trophy, Mic, Play, MicOff, Medal, CheckCircle2, HelpCircle } from "lucide-react";
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
  const [timeLeft, setTimeLeft] = useState(10); 
  const [gameState, setGameState] = useState<"ready" | "playing" | "ended">("ready");
  
  // NEW: State to pause the game for a second to show the "Success" animation
  const [roundSuccess, setRoundSuccess] = useState(false);

  const roundData = gameData.rounds[currentRound];

  const startGame = async () => {
    setScore(0);
    setCurrentRound(0);
    setGameState("playing");
    setRoundSuccess(false);
    const deepgramLang = getDeepgramLanguageCode(targetLanguage);
    await startRecording(deepgramLang);
  };

  // Timer Logic
  useEffect(() => {
    // Pause timer if game isn't playing or if we are showing the success animation
    if (gameState !== "playing" || roundSuccess) return;
    
    if (timeLeft <= 0) {
      handleNextRound();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameState, roundSuccess]);

  const handleNextRound = useCallback(() => {
    resetSpeechState();
    setRoundSuccess(false);
    
    if (currentRound + 1 >= gameData.rounds.length) {
      setGameState("ended");
      stopRecording();
      onGameOver(score + (timeLeft > 0 ? 1 : 0));
    } else {
      setCurrentRound((prev) => prev + 1);
      setTimeLeft(10);
    }
  }, [currentRound, gameData.rounds.length, score, timeLeft, resetSpeechState, stopRecording, onGameOver]);

  // LIVE GRADING LOGIC
  const lowerTranscript = transcript.toLowerCase();
  
  // Check in real-time if they have spoken the color or clothing
  const isColorMatched = roundData?.targetColors.some(color => lowerTranscript.includes(color.toLowerCase()));
  const isClothingMatched = roundData?.targetClothes.some(clothing => lowerTranscript.includes(clothing.toLowerCase()));

  useEffect(() => {
    if (gameState !== "playing" || roundSuccess || !roundData) return;

    if (isColorMatched && isClothingMatched) {
      // 1. Mark as successful
      setRoundSuccess(true);
      setScore((prev) => prev + 1);
      
      // 2. Pause for 1.5 seconds so the user can see their success feedback
      setTimeout(() => {
        handleNextRound();
      }, 1500);
    }
  }, [isColorMatched, isClothingMatched, gameState, roundSuccess, roundData, handleNextRound]);


  // --- READY STATE ---
  if (gameState === "ready") {
    return (
      <div className="flex flex-col items-center justify-center flex-grow space-y-8 text-center h-full min-h-[400px]">
        <div className="bg-blue-50 p-6 rounded-full shadow-inner mb-4">
          <Mic className="h-16 w-16 text-blue-500" />
        </div>
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-4">{gameData.gameTitle}</h2>
          <p className="text-lg text-slate-500 max-w-sm mx-auto leading-relaxed">
            Translate what the duck is wearing into <strong className="text-blue-600">{targetLanguage}</strong>!
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
      
      {/* Top Bar */}
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
        <div className={`w-full aspect-square max-w-[320px] rounded-[2rem] shadow-lg overflow-hidden border-8 transition-all duration-300 ${roundSuccess ? 'border-emerald-400 shadow-emerald-200 scale-105' : 'border-white bg-slate-100'} relative z-10`}>
          
          {/* Success Overlay */}
          {roundSuccess && (
            <div className="absolute inset-0 bg-emerald-500/20 z-20 flex items-center justify-center backdrop-blur-sm animate-in fade-in zoom-in">
              <CheckCircle2 className="w-24 h-24 text-emerald-500 drop-shadow-lg bg-white rounded-full" />
            </div>
          )}

          {roundData?.imageUrl ? (
            <img src={roundData.imageUrl} alt="Duck" className="w-full h-full object-cover"/>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">Loading...</div>
          )}
        </div>
      </div>

      {/* The Prompt / Task (Based on your screenshot) */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-1.5 text-blue-500 mb-1">
          <HelpCircle className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            Translate to {targetLanguage}
          </span>
        </div>
        <span className="text-slate-800 font-medium text-lg leading-tight px-1">
          "{roundData?.nativeColors.join(", ")} {roundData?.nativeClothes.join(", ")}"
        </span>
      </div>

      {/* Live Grading Transcript Box */}
      <div className={`w-full border rounded-3xl p-4 flex flex-col gap-3 shadow-sm relative overflow-hidden transition-colors ${
        roundSuccess ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"
      }`}>
        
        {/* Top half: Microphone and live words */}
        <div className="flex items-center gap-4">
          <div className={`relative flex shrink-0 items-center justify-center w-12 h-12 rounded-full transition-all ${
            roundSuccess ? "bg-emerald-500 text-white" : isRecording ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-slate-100 text-slate-400"
          }`}>
            {isRecording && !roundSuccess && (
              <div className="absolute inset-0 border-[3px] border-blue-400 rounded-full animate-ping opacity-75" />
            )}
            {roundSuccess ? <CheckCircle2 className="h-6 w-6 relative z-10" /> : isRecording ? <Mic className="h-5 w-5 relative z-10" /> : <MicOff className="h-5 w-5 relative z-10" />}
          </div>
          
          <div className="flex-grow min-h-[1.5rem] flex items-center">
            {transcript ? (
              <span className={`font-medium leading-tight ${roundSuccess ? "text-emerald-700" : "text-slate-700"}`}>
                "{transcript}"
              </span>
            ) : (
              <span className="text-slate-400 italic text-sm">Listening... Speak now</span>
            )}
          </div>
        </div>

        {/* Bottom half: Real-time visual feedback pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <div className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors flex items-center gap-1 ${
            isColorMatched ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
          }`}>
            {isColorMatched && <CheckCircle2 className="w-3 h-3" />}
            Color
          </div>
          <div className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors flex items-center gap-1 ${
            isClothingMatched ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
          }`}>
            {isClothingMatched && <CheckCircle2 className="w-3 h-3" />}
            Clothing Item
          </div>
        </div>
      </div>
      
    </div>
  );
}