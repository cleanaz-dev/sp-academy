"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSpeech } from "@/context/speech-context";
import { useListen } from "@/hooks/use-listen";
import { Button } from "@/components/ui/button";
import { getDeepgramLanguageCode } from "@/lib/utils";
import { 
  Play, 
  Pause, 
  Snail, 
  Mic, 
  MicOff, 
  Search, 
  CheckCircle2, 
  BookOpen, 
  Trophy, 
  HelpCircle,
  ShieldCheck,
  XCircle
} from "lucide-react";

// --- GAME DATA TYPES ---
export interface Scene {
  id: string;
  witnessName: string;
  witnessImageUrl: string;
  audioUrl: string;
  promptNative: string; // e.g. "The witness is describing the thief's jacket."
  targetKeywords: string[]; // Keywords needed in target language (e.g. ["verde", "chaqueta"])
  clueSummary: string; // Clue added to notebook (e.g. "Thief wears a green jacket")
}

export interface Suspect {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  isGuilty: boolean;
}

export interface DetectiveCapybaraData {
  gameTitle: string;
  scenes: Scene[];
  suspects: Suspect[]; // 4 suspects for the lineup
}

interface DetectiveCapybaraProps {
  gameData: DetectiveCapybaraData;
  targetLanguage?: string;
  nativeLanguage?: string;
  onGameOver: (finalScore: number) => void;
}

export default function DetectiveCapybaraEngine({
  gameData,
  targetLanguage = "ENGLISH",
  nativeLanguage = "FRENCH",
  onGameOver,
}: DetectiveCapybaraProps) {
  // Speech STT Context
  const { isRecording, transcript, startRecording, stopRecording, resetSpeechState } = useSpeech();

  // Engine States
  const [gameState, setGameState] = useState<"ready" | "investigating" | "lineup" | "ended">("ready");
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [collectedClues, setCollectedClues] = useState<string[]>([]);
  const [currentClueUnlocked, setCurrentClueUnlocked] = useState(false);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [isWin, setIsWin] = useState(false);

  const currentScene = gameData.scenes[currentSceneIndex];

  // Audio Hook bound to current scene's audio URL
  const { isPlaying, isEnded, play, pause, progress, setPlaybackRate, playbackRate } = useListen(
    currentScene?.audioUrl
  );

  // 1. START GAME
  const startGame = async () => {
    setGameState("investigating");
    setCurrentSceneIndex(0);
    setCollectedClues([]);
    setCurrentClueUnlocked(false);
    resetSpeechState();

    const deepgramLang = getDeepgramLanguageCode(targetLanguage);
    await startRecording(deepgramLang);
  };

  // 2. AUTO-RECORD WHEN WITNESS STOPS TALKING
  useEffect(() => {
    if (isEnded && gameState === "investigating" && !isRecording) {
      const deepgramLang = getDeepgramLanguageCode(targetLanguage);
      startRecording(deepgramLang);
    }
  }, [isEnded, gameState, isRecording, targetLanguage, startRecording]);

  // 3. LIVE KEYWORD CHECKING FOR CLUES
  useEffect(() => {
    if (gameState !== "investigating" || !transcript || currentClueUnlocked || !currentScene) return;

    const lowerTranscript = transcript.toLowerCase();
    
    // Check if transcript contains ALL or ANY target keywords for this scene
    const matchedAllKeywords = currentScene.targetKeywords.every((kw) =>
      lowerTranscript.includes(kw.toLowerCase())
    );

    if (matchedAllKeywords) {
      setCurrentClueUnlocked(true);
      setCollectedClues((prev) => [...prev, currentScene.clueSummary]);
    }
  }, [transcript, gameState, currentClueUnlocked, currentScene]);

  // 4. NEXT SCENE OR TRANSITION TO LINEUP
  const handleNextScene = useCallback(() => {
    resetSpeechState();
    setCurrentClueUnlocked(false);

    if (currentSceneIndex + 1 < gameData.scenes.length) {
      setCurrentSceneIndex((prev) => prev + 1);
    } else {
      // All scenes investigated -> Go to Lineup!
      stopRecording();
      setGameState("lineup");
    }
  }, [currentSceneIndex, gameData.scenes.length, resetSpeechState, stopRecording]);

  // 5. ACCUSE SUSPECT
  const handleAccuseSuspect = (suspect: Suspect) => {
    setSelectedSuspectId(suspect.id);
    const win = suspect.isGuilty;
    setIsWin(win);
    setGameState("ended");

    const finalScore = win ? 100 : 25;
    onGameOver(finalScore);
  };

  // --- READY STATE ---
  if (gameState === "ready") {
    return (
      <div className="flex flex-col items-center justify-center flex-grow space-y-8 text-center h-full min-h-[420px]">
        <div className="bg-amber-100 p-6 rounded-full shadow-inner">
          <Search className="h-16 w-16 text-amber-600" />
        </div>
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-3">{gameData.gameTitle}</h2>
          <p className="text-lg text-slate-500 max-w-sm mx-auto leading-relaxed">
            Listen to the witness clues in <strong className="text-blue-600">{targetLanguage}</strong>, record your notebook clues, and catch the thief!
          </p>
        </div>
        <Button
          onClick={startGame}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl px-10 py-7 text-xl font-bold shadow-xl shadow-amber-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
        >
          <Play className="h-6 w-6 fill-current" />
          Start Investigation
        </Button>
      </div>
    );
  }

  // --- ENDED STATE ---
  if (gameState === "ended") {
    return (
      <div className="flex flex-col items-center justify-center flex-grow space-y-6 h-full min-h-[420px] text-center animate-in zoom-in duration-300">
        <div className="relative">
          {isWin ? (
            <ShieldCheck className="h-24 w-24 text-emerald-500 drop-shadow-xl" />
          ) : (
            <XCircle className="h-24 w-24 text-rose-500 drop-shadow-xl" />
          )}
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900">
          {isWin ? "Case Solved!" : "Wrong Suspect!"}
        </h2>
        <p className="text-slate-500 max-w-xs">
          {isWin
            ? "Detective Capybara caught the culprit thanks to your precise notes!"
            : "The real thief escaped. Keep practicing your listening skills!"}
        </p>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 px-12 flex flex-col items-center shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</span>
          <span className={`text-5xl font-black ${isWin ? "text-emerald-500" : "text-slate-700"}`}>
            {isWin ? "100" : "25"}
          </span>
        </div>
      </div>
    );
  }

  // --- LINEUP STATE ---
  if (gameState === "lineup") {
    return (
      <div className="flex flex-col flex-grow h-full w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-900">Police Lineup</h2>
          <p className="text-xs text-slate-500 mt-1">Review your notebook clues and accuse the culprit!</p>
        </div>

        {/* Notebook Clues Review */}
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="h-4 w-4" />
            Detective's Notebook ({collectedClues.length} Clues)
          </div>
          <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
            {collectedClues.map((clue, idx) => (
              <li key={idx}>{clue}</li>
            ))}
          </ul>
        </div>

        {/* 4 Suspects Selection Grid */}
        <div className="grid grid-cols-2 gap-4 flex-grow">
          {gameData.suspects.map((suspect) => (
            <div
              key={suspect.id}
              onClick={() => handleAccuseSuspect(suspect)}
              className="group cursor-pointer bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-slate-100 group-hover:border-amber-400">
                <img src={suspect.imageUrl} alt={suspect.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">{suspect.name}</h4>
              <p className="text-[11px] text-slate-500 mt-1">{suspect.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- INVESTIGATING STATE (SCENES) ---
  return (
    <div className="flex flex-col flex-grow h-full max-w-md mx-auto w-full space-y-5">
      
      {/* Top Header */}
      <div className="flex justify-between items-center w-full">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Scene {currentSceneIndex + 1} of {gameData.scenes.length}
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-xl text-xs font-bold">
          <BookOpen className="h-3.5 w-3.5" />
          {collectedClues.length} Clues
        </div>
      </div>

      {/* Witness Image & Audio Player */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 flex flex-col items-center relative shadow-sm">
        <div className={`relative w-28 h-28 rounded-full overflow-hidden border-4 mb-3 transition-transform ${isPlaying ? "border-amber-400 scale-105" : "border-white"}`}>
          <img src={currentScene.witnessImageUrl} alt={currentScene.witnessName} className="w-full h-full object-cover" />
        </div>
        <h3 className="font-bold text-slate-800 text-base">{currentScene.witnessName}</h3>

        {/* Audio Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-amber-500 h-full transition-all duration-100" style={{ width: `${progress}%` }} />
        </div>

        {/* Audio Controls (Play & Turtle Mode) */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => {
              setPlaybackRate(1.0);
              isPlaying ? pause() : play();
            }}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            {isPlaying ? "Pause" : "Listen"}
          </button>

          <button
            onClick={() => {
              setPlaybackRate(0.7);
              play();
            }}
            className={`p-2.5 rounded-xl border transition-colors ${
              playbackRate === 0.7 ? "bg-amber-100 border-amber-300 text-amber-800" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
            }`}
            title="Slow Speed (0.7x)"
          >
            <Snail className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Task Prompt */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5 flex items-start gap-2.5">
        <HelpCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
        <div className="flex flex-col text-xs">
          <span className="font-bold text-blue-500 uppercase tracking-wider text-[10px]">Objective ({nativeLanguage})</span>
          <span className="text-slate-700 font-medium">{currentScene.promptNative}</span>
        </div>
      </div>

      {/* STT Dictation Transcript & Clue Unlock Feedback */}
      <div className={`border rounded-3xl p-4 flex flex-col gap-3 transition-colors ${currentClueUnlocked ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-full ${currentClueUnlocked ? "bg-emerald-500 text-white" : isRecording ? "bg-blue-500 text-white animate-pulse" : "bg-slate-100 text-slate-400"}`}>
            {currentClueUnlocked ? <CheckCircle2 className="h-5 w-5" /> : isRecording ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </div>
          <div className="text-xs text-slate-700 italic flex-grow">
            {transcript ? `"${transcript}"` : `Listen to witness, then state clue in ${targetLanguage}...`}
          </div>
        </div>

        {/* Unlocked Clue Badge */}
        {currentClueUnlocked && (
          <div className="bg-emerald-100/80 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 font-semibold flex items-center justify-between animate-in fade-in">
            <span>Clue Discovered: "{currentScene.clueSummary}"</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
        )}
      </div>

      {/* Next Scene Button */}
      <Button
        onClick={handleNextScene}
        disabled={!currentClueUnlocked}
        className="w-full py-6 rounded-2xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-50"
      >
        {currentSceneIndex + 1 === gameData.scenes.length ? "Go to Police Lineup" : "Next Witness"}
      </Button>

    </div>
  );
}