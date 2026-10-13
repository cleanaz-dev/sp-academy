"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Mic, CheckCircle2, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FoundationFreestyleControls } from "../foundation-freestyle-controls";
import { FoundationFreestyleChatBubble } from "../foundation-freestye-chat-bubble";
import { useBossFoundation } from "@/context/boss-context";

// --- TYPES ---
export type ExerciseType = "MULTIPLE_CHOICE" | "SENTENCE_BUILDER" | "PRONUNCIATION" | "IMAGE_MATCH";

export interface BossExercise {
  id: string;
  type: ExerciseType;
  instruction: string;
  // Multiple Choice
  question?: string;
  options?: string[];
  // Sentence Builder
  scrambledWords?: string[];
  // Pronunciation
  targetText?: string;
}

// Extends your standard chat message
export interface BossMessage {
  id: number;
  role: "assistant" | "user" | "exercise";
  text?: string;
  exercise?: BossExercise; 
  status?: "pending" | "correct" | "incorrect"; // Tracks if they passed this specific block
}

interface Props {
  onEnd: () => void;
  scenarioData: any; // The JSON from your Prisma model
}

export default function BossFoundationFreestyle({ onEnd, scenarioData }: Props) {
  const {
    session,
    messages, // Assuming this array now supports the BossMessage interface
    isRecording,
    transcript,
    isProcessing,
    isAiProcessing,
    isPlaying,
    isSpeechLoading,
    submitTurn,
    startRecording,
  } = useBossFoundation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiAvatarUrl = (session as any).aiAvatarUrl as string | undefined;
  const isAudioBusy = isPlaying || isSpeechLoading;
  const showThinking = isAiProcessing && !isRecording;

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isProcessing]);

  // Handle a user submitting an exercise answer
  // You will need to wire this up to your API to evaluate the answer & trigger the next AI turn
  const handleExerciseSubmit = (exerciseId: string, answer: string | string[]) => {
    console.log(`Submitting answer for ${exerciseId}:`, answer);
    
    // TODO: In your context/API, you should evaluate this answer.
    // If correct -> mark message status as 'correct', AI says "Good job!", next exercise.
    // If incorrect -> mark message status as 'incorrect', AI says "Try again!", same exercise.
  };

  return (
    <div className="flex flex-col gap-4">
      {/* BOSS STAGE HEADER */}
      <div className="shrink-0 flex items-center gap-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
        <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center shrink-0">
          <span className="text-xl">😈</span>
        </div>
        <div>
          <h4 className="text-[11px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">
            Boss Challenge
          </h4>
          <p className="text-slate-200 font-medium text-sm md:text-base">
            {scenarioData?.bossName || "Complete the exercises to defeat the boss!"}
          </p>
        </div>
      </div>

      <div className="relative h-[550px] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-inner">
        <ScrollArea className="h-full">
          <div className="space-y-6 p-6 sm:p-8">
            {messages.length === 0 && !isProcessing && !isRecording && (
              <div className="flex min-h-[200px] flex-col items-center justify-center text-center opacity-60">
                <p className="text-sm font-medium text-slate-400">
                  Initializing Boss Stage...
                </p>
              </div>
            )}

            {messages.map((message: BossMessage) => {
              // 1. Render Normal AI/User Chat Bubbles
              if (message.role !== "exercise") {
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
        <div className="flex min-w-0 flex-1">
          <FoundationFreestyleControls />
        </div>
        <button
          onClick={onEnd}
          className="w-full md:w-auto h-[72px] px-8 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-2xl md:rounded-3xl text-lg shadow-xl shadow-rose-900/50 transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
        >
          Flee Battle <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXERCISE RENDERER COMPONENTS
// ============================================================================

function ExerciseBlock({ 
  message, 
  onSubmit, 
  isRecording, 
  transcript, 
  startRecording 
}: { 
  message: BossMessage;
  onSubmit: (id: string, answer: any) => void;
  isRecording: boolean;
  transcript: string;
  startRecording: () => void;
}) {
  const exercise = message.exercise;
  if (!exercise) return null;

  const isCompleted = message.status === "correct" || message.status === "incorrect";

  return (
    <div className={`w-full max-w-[90%] md:max-w-[80%] rounded-2xl p-5 border shadow-lg ${
      message.status === 'correct' ? 'bg-emerald-900/20 border-emerald-500/30' :
      message.status === 'incorrect' ? 'bg-rose-900/20 border-rose-500/30' :
      'bg-slate-800 border-slate-700'
    }`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {exercise.type.replace("_", " ")}
        </span>
        {message.status === 'correct' && <CheckCircle2 className="text-emerald-400" size={20} />}
        {message.status === 'incorrect' && <XCircle className="text-rose-400" size={20} />}
      </div>

      <p className="text-white font-medium mb-6">{exercise.instruction}</p>

      {/* Mini-Games */}
      <div className="relative">
        {isCompleted && <div className="absolute inset-0 z-10 bg-transparent" /> /* Prevents clicks if done */}
        
        {exercise.type === "MULTIPLE_CHOICE" && (
          <div className="flex flex-col gap-2">
            {exercise.options?.map((opt, i) => (
              <button
                key={i}
                onClick={() => onSubmit(exercise.id, opt)}
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
            onSubmit={(ans) => onSubmit(exercise.id, ans)} 
          />
        )}

        {exercise.type === "PRONUNCIATION" && (
          <PronunciationExercise 
            target={exercise.targetText || ""}
            isRecording={isRecording}
            transcript={transcript}
            startRecording={startRecording}
            onSubmit={(ans) => onSubmit(exercise.id, ans)} 
          />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 1. SENTENCE BUILDER (Tap-to-select logic instead of Drag and Drop)
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
    <div className="flex flex-col gap-6">
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
      {selected.length === words.length && (
        <button 
          onClick={() => onSubmit(selected)}
          className="mt-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors"
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
            className="mt-3 w-full py-2 bg-emerald-600 text-white font-bold rounded-lg"
          >
            Submit Audio
          </button>
        </div>
      )}
    </div>
  );
}