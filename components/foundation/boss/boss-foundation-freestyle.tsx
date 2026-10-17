// components/foundation/boss/boss-foundation-freestyle.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Mic,
  CheckCircle2,
  XCircle,
  Heart,
  Zap,
  Clock,
  Volume2,
  RotateCcw,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useBossFoundation,
  BossMessage,
  ImageOption,
} from "@/context/boss-context";
import { BossFoundationFreestyleControls } from "./boss-foundation-freestyle-controls";
import { BossFoundationFreestyleChatBubble } from "./boss-freestyle-chat-bubble";
import { useWordAudio } from "@/context/word-audio-context";
import { ExerciseBlock } from "./exercise-block";
import { usePronunciation } from "@/context/pronunciation-context";

interface Props {
  onEnd: () => void;
  scenarioData?: any;
}

export default function BossFoundationFreestyle({ onEnd }: Props) {
  const {
    session,
    boss,
    messages,
    chances,
    xp,
    currentIndex,
    totalExercises,
    stageStatus,
    hasStartedExercises, // <-- MAKE SURE TO DESTRUCTURE THIS
    isRecording,
    transcript,
    isProcessing,
    isAiProcessing,
    startExercises, // <-- MAKE SURE TO DESTRUCTURE THIS
    submitExerciseAnswer,
    handleTimeOut,
    submitTurn,
    startRecording,
    playExerciseAudio,
    resolveAssetUrl,
    resetRecording,
  } = useBossFoundation();

  // 1. Grab playWord from the context!
  const { playWord, stopAudio: stopWordAudio } = useWordAudio();
  const { stopRecording } = usePronunciation()

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const aiAvatarUrl = boss?.avatarKey
    ? resolveAssetUrl(boss.avatarKey)
    : "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=boss";

  const showThinking = isAiProcessing && !isRecording;
  const hasPendingExercise = messages.some(
    (m) => m.exercise && m.status === "pending",
  );
  const progressPercent = Math.min((currentIndex / totalExercises) * 100, 100);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isProcessing, isAiProcessing]);

  return (
    // 1. THE OUTER WRAPPER: Lock the height so the page CANNOT scroll.
    // 'h-[calc(100vh-2rem)]' ensures it fits on screen with a tiny bit of margin.
    <div className="flex flex-col w-full h-[calc(100vh-2rem)] max-h-[900px] max-w-5xl mx-auto bg-slate-50 rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative">
      {/* 🛑 FAIL OVERLAY (Retry Screen) */}
      {stageStatus === "FAILED" && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="text-rose-500" size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
            Out of Hearts!
          </h2>
          <p className="text-slate-500 font-medium mb-8 max-w-sm">
            {boss?.name} was not impressed. Take a deep breath and try the
            encounter again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full max-w-sm py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-lg transition-all active:translate-y-1 active:border-b-0 border-b-4 border-indigo-800 shadow-sm flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Retry Encounter
          </button>
          <button
            onClick={onEnd}
            className="mt-4 text-slate-400 font-bold hover:text-slate-600 transition-colors"
          >
            Flee Battle
          </button>
        </div>
      )}

      {/* 🎮 TOP STATS BAR (Shrink-0 prevents it from squishing) */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col gap-3 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
              <img
                src={aiAvatarUrl}
                alt="Boss"
                className="w-full h-full object-cover"
              />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide hidden sm:block">
              {boss?.name || "Milestone Boss"}
            </h4>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((heartIndex) => (
              <Heart
                key={heartIndex}
                size={22}
                className={`transition-all duration-300 ${
                  heartIndex <= chances
                    ? "fill-rose-500 text-rose-500 scale-100 drop-shadow-sm"
                    : "fill-slate-200 text-slate-200 scale-90"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Zap size={18} className="text-amber-500 fill-amber-500" />
            <span className="text-amber-600 font-extrabold text-sm">
              {xp} XP
            </span>
          </div>
        </div>

        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 💬 CHAT / GAME AREA */}
      {/* flex-1 lets it fill remaining space. overflow-hidden stops it from breaking boundaries */}
      <div className="flex-1 overflow-hidden relative bg-slate-50/50">
        {/* We add py-10 to the ScrollArea contents so the chat doesn't touch the top/bottom bars */}
        <ScrollArea className="h-full w-full">
          <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-8 py-10">
            {messages.length === 0 && !isProcessing && !isRecording && (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center opacity-60">
                <p className="text-sm font-medium text-slate-500">
                  Initializing challenge...
                </p>
              </div>
            )}

            {messages.map((message: BossMessage) => {
              if (!message.exercise) {
                return (
                  <BossFoundationFreestyleChatBubble
                    key={message.id}
                    message={message}
                    aiAvatarUrl={aiAvatarUrl}
                    ttsStatus="idle"
                  />
                );
              }

              return (
                <ExerciseBlock
                  key={message.id}
                  message={message}
                  onSubmit={submitExerciseAnswer}
                  onSubmitVoice={submitTurn}
                  onTimeOut={handleTimeOut}
                  isRecording={isRecording}
                  isAiProcessing={isAiProcessing}
                  transcript={transcript}
                  startRecording={startRecording}
                  resetRecording={resetRecording}
                  playExerciseAudio={playExerciseAudio}
                  resolveAssetUrl={resolveAssetUrl}
                  playWord={playWord}          
                  stopWordAudio={stopWordAudio}
                  stopRecording={stopRecording}
                />
              );
            })}

            {isRecording && transcript && !hasPendingExercise && (
              <div className="flex flex-col items-end animate-in slide-in-from-bottom-2">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-5 py-3.5 text-[15px] leading-relaxed text-white shadow-md">
                  {transcript}
                  <span className="animate-pulse ml-1">...</span>
                </div>
              </div>
            )}

            {showThinking && (
              <BossFoundationFreestyleChatBubble
                message={{ id: "thinking", role: "assistant", text: "" }}
                aiAvatarUrl={aiAvatarUrl}
                ttsStatus="thinking"
              />
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>
      </div>

      {/* 🛑 BOTTOM ACTION BAR (Shrink-0 to lock it to bottom) */}
      <div className="shrink-0 bg-white border-t border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row gap-4 relative z-10">
        {!hasStartedExercises ? (
          <button
            onClick={startExercises}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-lg transition-all active:translate-y-1 active:border-b-0 border-b-4 border-indigo-800 shadow-sm animate-in slide-in-from-bottom-2 flex items-center justify-center"
          >
            {isProcessing ? "Skip Intro & Begin" : "I'm Ready, Let's Begin"}
          </button>
        ) : stageStatus === "PLAYING" ? (
          hasPendingExercise ? (
            <div className="flex-1 flex items-center justify-center px-6 py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">
                Complete the exercise above to continue
              </span>
            </div>
          ) : (
            <div className="flex min-w-0 flex-1">
              <BossFoundationFreestyleControls />
            </div>
          )
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest">
              Encounter {stageStatus}
            </p>
          </div>
        )}

        {stageStatus === "PASSED" && (
          <button
            onClick={onEnd}
            className="w-full md:w-auto py-4 px-8 text-white font-extrabold rounded-2xl text-lg transition-all active:translate-y-1 active:border-b-0 border-b-4 flex items-center justify-center gap-2 shrink-0 bg-emerald-500 hover:bg-emerald-400 border-emerald-700 shadow-sm"
          >
            Claim Victory <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

