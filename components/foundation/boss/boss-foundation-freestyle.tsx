"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mic, CheckCircle2, XCircle, Heart, Zap, Clock } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { FoundationFreestyleControls } from "../foundation-freestyle-controls";
import { FoundationFreestyleChatBubble } from "../foundation-freestye-chat-bubble";
import { useBossFoundation, BossMessage } from "@/context/boss-context";

interface Props {
  onEnd: () => void;
  scenarioData: any; // The JSON from your Prisma model
}

export default function BossFoundationFreestyle({ onEnd, scenarioData }: Props) {
  const {
    session,
    messages,
    chances,
    xp,
    stageStatus,
    isRecording,
    transcript,
    isProcessing,
    isAiProcessing,
    isPlaying,
    isSpeechLoading,
    submitTurn,
    submitExerciseAnswer,
    handleTimeOut,
    startRecording,
  } = useBossFoundation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiAvatarUrl = (session as any).aiAvatarUrl as string | undefined;
  const isAudioBusy = isPlaying || isSpeechLoading;
  const showThinking = isAiProcessing && !isRecording;

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isProcessing, isAiProcessing]);

  // Pass the answer to our context engine
  const handleExerciseSubmit = (answer: any) => {
    submitExerciseAnswer(answer);
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* 🎮 TOP STATS BAR (Lives, XP, Status) */}
      <div className="shrink-0 flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        {/* Lives (Chances) */}
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((heartIndex) => (
            <Heart
              key={heartIndex}
              size={24}
              className={`transition-all ${
                heartIndex <= chances
                  ? "fill-rose-500 text-rose-500 scale-100"
                  : "fill-transparent text-slate-700 scale-90 opacity-50"
              }`}
            />
          ))}
        </div>

        {/* Milestone Title */}
        <div className="text-center hidden sm:block">
          <h4 className="text-[11px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">
            Milestone Challenge
          </h4>
          <p className="text-slate-300 font-medium text-sm">
            {stageStatus === "PLAYING" ? "Defeat the stages!" : stageStatus === "PASSED" ? "Victory!" : "Failed"}
          </p>
        </div>

        {/* XP Counter */}
        <div className="flex items-center gap-2 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
          <Zap size={18} className="text-amber-400 fill-amber-400" />
          <span className="text-amber-400 font-bold tracking-wide">{xp} XP</span>
        </div>
      </div>

      {/* CHAT / GAME AREA */}
      <div className="relative h-[550px] overflow-hidden rounded-3xl bg-slate-900/50 border border-slate-800 shadow-inner">
        <ScrollArea className="h-full">
          <div className="space-y-6 p-6 sm:p-8">
            {messages.length === 0 && !isProcessing && !isRecording && (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center opacity-60">
                <p className="text-sm font-medium text-slate-400">
                  Initializing challenge...
                </p>
              </div>
            )}

            {messages.map((message: BossMessage) => {
              // 1. Render Normal AI/User Chat Bubbles
              if (!message.exercise) {
                return (
                  <FoundationFreestyleChatBubble
                    key={message.id}
                    message={message}
                    aiAvatarUrl={aiAvatarUrl}
                    ttsStatus="idle"
                  />
                );
              }

              // 2. Render Interactive Exercise Blocks
              return (
                <ExerciseBlock 
                  key={message.id} 
                  message={message} 
                  onSubmit={handleExerciseSubmit}
                  onTimeOut={handleTimeOut}
                  isRecording={isRecording}
                  transcript={transcript}
                  startRecording={startRecording}
                />
              );
            })}

            {/* Live Transcript Bubble for standard voice turns */}
            {isRecording && transcript && (
              <div className="flex flex-col items-end animate-in slide-in-from-bottom-2">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-5 py-3.5 text-[15px] leading-relaxed text-white shadow-md">
                  {transcript}
                  <span className="animate-pulse ml-1">...</span>
                </div>
              </div>
            )}

            {/* AI "Thinking..." placeholder */}
            {showThinking && (
              <FoundationFreestyleChatBubble
                message={{ id: "thinking", role: "assistant", text: "" }}
                aiAvatarUrl={aiAvatarUrl}
                ttsStatus="thinking"
              />
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="shrink-0 flex flex-col md:flex-row gap-4 h-auto md:h-[72px]">
        {/* Only show mic controls if we are still playing */}
        {stageStatus === "PLAYING" ? (
          <div className="flex min-w-0 flex-1">
            <FoundationFreestyleControls />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-900 rounded-3xl border border-slate-800">
            <p className="text-slate-400 font-medium">Stage {stageStatus}</p>
          </div>
        )}

        <button
          onClick={onEnd}
          className={`w-full md:w-auto h-[72px] px-8 text-white font-extrabold rounded-2xl md:rounded-3xl text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0 ${
            stageStatus === "PASSED" 
              ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50" 
              : "bg-rose-600 hover:bg-rose-500 shadow-rose-900/50"
          }`}
        >
          {stageStatus === "PASSED" ? "Claim Victory" : stageStatus === "FAILED" ? "Exit Stage" : "Flee Battle"} 
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXERCISE RENDERER COMPONENT
// ============================================================================

function ExerciseBlock({ 
  message, 
  onSubmit, 
  onTimeOut,
  isRecording, 
  transcript, 
  startRecording 
}: { 
  message: BossMessage;
  onSubmit: (answer: any) => void;
  onTimeOut: () => void;
  isRecording: boolean;
  transcript: string;
  startRecording: () => void;
}) {
  const exercise = message.exercise;
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(15);
  const isCompleted = message.status === "correct" || message.status === "incorrect";

  useEffect(() => {
    // If it's already answered, freeze timer
    if (isCompleted) return;

    // Time's up!
    if (timeLeft <= 0) {
      onTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isCompleted, onTimeOut]);

  if (!exercise) return null;

  return (
    <div className={`w-full max-w-[90%] md:max-w-[80%] rounded-2xl p-5 border shadow-lg transition-colors duration-500 ${
      message.status === 'correct' ? 'bg-emerald-900/20 border-emerald-500/30' :
      message.status === 'incorrect' ? 'bg-rose-900/20 border-rose-500/30' :
      'bg-slate-800 border-slate-700'
    }`}>
      
      {/* Header & Timer */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          {exercise.type.replace("_", " ")}
        </span>
        
        {/* Status Indicators */}
        {message.status === 'correct' && <CheckCircle2 className="text-emerald-400 animate-in zoom-in" size={24} />}
        {message.status === 'incorrect' && <XCircle className="text-rose-400 animate-in zoom-in" size={24} />}
        {message.status === 'pending' && (
          <div className={`flex items-center gap-1.5 font-bold ${timeLeft <= 5 ? "text-rose-400 animate-pulse" : "text-amber-400"}`}>
            <Clock size={16} />
            {timeLeft}s
          </div>
        )}
      </div>

      <p className="text-white font-medium mb-5">{exercise.instruction}</p>

      {/* Visual Timer Bar */}
      {message.status === 'pending' && (
        <div className="w-full h-1.5 bg-slate-900 rounded-full mb-6 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-1000 linear ${timeLeft <= 5 ? "bg-rose-500" : "bg-amber-400"}`}
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          />
        </div>
      )}

      {/* Mini-Games Container */}
      <div className="relative">
        {/* Invisible overlay to prevent clicks after answering */}
        {isCompleted && <div className="absolute inset-0 z-10 bg-transparent" />}
        
        {exercise.type === "MULTIPLE_CHOICE" && (
          <div className="flex flex-col gap-2">
            {exercise.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => onSubmit(opt)}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-700/50 hover:bg-indigo-600 hover:text-white text-slate-200 transition-colors border border-slate-600 hover:border-indigo-500"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {exercise.type === "SENTENCE_BUILDER" && (
          <SentenceBuilder 
            words={exercise.scrambledWords || []} 
            onSubmit={(ans) => onSubmit(ans)} 
          />
        )}

        {exercise.type === "PRONUNCIATION" && (
          <PronunciationExercise 
            target={exercise.targetText || ""}
            isRecording={isRecording}
            transcript={transcript}
            startRecording={startRecording}
            onSubmit={(ans) => onSubmit(ans)} 
          />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 1. SENTENCE BUILDER (Tap-to-select logic)
// ----------------------------------------------------------------------------
function SentenceBuilder({ words, onSubmit }: { words: string[], onSubmit: (ans: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>(words);

  const selectWord = (word: string, idx: number) => {
    setSelected([...selected, word]);
    setAvailable(available.filter((_, i) => i !== idx));
  };

  const removeWord = (word: string, idx: number) => {
    setAvailable([...available, word]);
    setSelected(selected.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Drop Zone (Selected Words) */}
      <div className="min-h-[60px] p-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-900/50 flex flex-wrap gap-2 items-center">
        {selected.length === 0 && <span className="text-slate-500 text-sm ml-2">Tap words below...</span>}
        {selected.map((w, i) => (
          <button 
            key={`sel-${i}`} 
            onClick={() => removeWord(w, i)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-sm active:scale-95 transition-transform"
          >
            {w}
          </button>
        ))}
      </div>

      {/* Word Bank (Available Words) */}
      <div className="flex flex-wrap gap-2">
        {available.map((w, i) => (
          <button 
            key={`avail-${i}`} 
            onClick={() => selectWord(w, i)}
            className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg shadow-sm border border-slate-600 hover:bg-slate-600 active:scale-95 transition-transform"
          >
            {w}
          </button>
        ))}
      </div>

      {/* Submit Button */}
      {selected.length > 0 && selected.length === words.length && (
        <button 
          onClick={() => onSubmit(selected)}
          className="mt-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors animate-in slide-in-from-bottom-2"
        >
          Check Answer
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 2. PRONUNCIATION EXERCISE 
// ----------------------------------------------------------------------------
function PronunciationExercise({ 
  target, onSubmit, isRecording, transcript, startRecording 
}: { 
  target: string;
  onSubmit: (text: string) => void;
  isRecording: boolean;
  transcript: string;
  startRecording: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="text-2xl font-bold text-white mb-2">"{target}"</div>
      
      {!isRecording ? (
        <button 
          onClick={startRecording}
          className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 hover:scale-105 active:scale-95 transition-all"
        >
          <Mic className="text-white" size={28} />
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-rose-600 animate-pulse flex items-center justify-center shadow-lg shadow-rose-900/50">
            <Mic className="text-white" size={28} />
          </div>
          <p className="text-indigo-300 font-medium text-sm">Listening...</p>
        </div>
      )}

      {isRecording && transcript && (
        <div className="mt-4 p-3 bg-slate-800 rounded-xl border border-slate-700 w-full">
          <p className="text-slate-300">You said: <span className="text-white">"{transcript}"</span></p>
          <button 
            onClick={() => onSubmit(transcript)}
            className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
          >
            Submit Audio
          </button>
        </div>
      )}
    </div>
  );
}