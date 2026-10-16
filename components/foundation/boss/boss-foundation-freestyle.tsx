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
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { FoundationFreestyleControls } from "../foundation-freestyle-controls";
import { FoundationFreestyleChatBubble } from "../foundation-freestye-chat-bubble";
import {
  useBossFoundation,
  BossMessage,
  ImageOption,
} from "@/context/boss-context";

interface Props {
  onEnd: () => void;
  scenarioData?: any;
}

export default function BossFoundationFreestyle({ onEnd, scenarioData }: Props) {
  const {
    session,
    boss,
    messages,
    chances,
    xp,
    currentIndex,
    totalExercises,
    stageStatus,
    isRecording,
    transcript,
    isProcessing,
    isAiProcessing,
    submitExerciseAnswer,
    handleTimeOut,
    startRecording,
    playExerciseAudio,
    resolveAssetUrl,
  } = useBossFoundation();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiAvatarUrl =
    (session as any)?.aiAvatarUrl ||
    (boss?.avatarKey ? resolveAssetUrl(boss.avatarKey) : undefined);
  const showThinking = isAiProcessing && !isRecording;

  // Check if the current active item is an inline exercise
  const hasPendingExercise = messages.some(
    (m) => m.exercise && m.status === "pending"
  );

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, transcript, isProcessing, isAiProcessing]);

  const handleExerciseSubmit = (answer: any) => {
    submitExerciseAnswer(answer);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 🎮 TOP STATS BAR (Lives, Boss Name & Progress, XP) */}
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

        {/* Boss Persona & Progress */}
        <div className="text-center hidden sm:block">
          <h4 className="text-[11px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">
            {boss?.name || "Milestone Challenge"}
          </h4>
          <p className="text-slate-300 font-medium text-sm">
            {stageStatus === "PLAYING"
              ? `Challenge ${Math.min(currentIndex + 1, totalExercises)} of ${totalExercises}`
              : stageStatus === "PASSED"
              ? "Victory!"
              : "Failed"}
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
                  isAiProcessing={isAiProcessing}
                  transcript={transcript}
                  startRecording={startRecording}
                  playExerciseAudio={playExerciseAudio}
                  resolveAssetUrl={resolveAssetUrl}
                />
              );
            })}

            {/* Live Transcript Bubble (Only show for open conversation turns, not inside Pronunciation exercise) */}
            {isRecording && transcript && !hasPendingExercise && (
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
        {stageStatus === "PLAYING" ? (
          hasPendingExercise ? (
            <div className="flex-1 flex items-center justify-between px-6 py-4 bg-slate-900 rounded-3xl border border-slate-800">
              <span className="text-sm text-slate-400 font-medium">
                Complete the exercise card above to continue
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {Math.min(currentIndex + 1, totalExercises)} / {totalExercises}
              </span>
            </div>
          ) : (
            <div className="flex min-w-0 flex-1">
              <FoundationFreestyleControls />
            </div>
          )
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
          {stageStatus === "PASSED"
            ? "Claim Victory"
            : stageStatus === "FAILED"
            ? "Exit Stage"
            : "Flee Battle"}
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
  isAiProcessing,
  transcript,
  startRecording,
  playExerciseAudio,
  resolveAssetUrl,
}: {
  message: BossMessage;
  onSubmit: (answer: any) => void;
  onTimeOut: () => void;
  isRecording: boolean;
  isAiProcessing: boolean;
  transcript: string;
  startRecording: () => void;
  playExerciseAudio: (audioKey?: string | null, fallbackText?: string | null) => Promise<void>;
  resolveAssetUrl: (key?: string | null) => string;
}) {
  const exercise = message.exercise;

  // Give 20 seconds for sentence builders / pronunciation, 15s for quick selectors
  const initialTime =
    exercise?.type === "SENTENCE_BUILDER" ||
    exercise?.type === "LISTEN_SENTENCE_BUILDER" ||
    exercise?.type === "PRONUNCIATION"
      ? 25
      : 15;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const isCompleted =
    message.status === "correct" || message.status === "incorrect";

  // Pause countdown when completed, actively recording voice, or waiting on AI evaluation
  const isTimerPaused = isCompleted || isRecording || isAiProcessing;

  useEffect(() => {
    if (isTimerPaused) return;

    if (timeLeft <= 0) {
      onTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isTimerPaused, onTimeOut]);

  if (!exercise) return null;

  const expectedWordCount = Array.isArray(exercise.correctAnswer)
    ? exercise.correctAnswer.length
    : undefined;

  return (
    <div
      className={`w-full max-w-[95%] md:max-w-[85%] rounded-2xl p-5 border shadow-lg transition-colors duration-500 ${
        message.status === "correct"
          ? "bg-emerald-900/20 border-emerald-500/30"
          : message.status === "incorrect"
          ? "bg-rose-900/20 border-rose-500/30"
          : "bg-slate-800 border-slate-700"
      }`}
    >
      {/* Header & Timer */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          {exercise.type.replace(/_/g, " ")}
        </span>

        {message.status === "correct" && (
          <CheckCircle2 className="text-emerald-400 animate-in zoom-in" size={24} />
        )}
        {message.status === "incorrect" && (
          <XCircle className="text-rose-400 animate-in zoom-in" size={24} />
        )}
        {message.status === "pending" && (
          <div
            className={`flex items-center gap-1.5 font-bold ${
              timeLeft <= 5 ? "text-rose-400 animate-pulse" : "text-amber-400"
            }`}
          >
            <Clock size={16} />
            {timeLeft}s
          </div>
        )}
      </div>

      {/* Instruction */}
      <p className="text-slate-200 text-sm font-medium mb-3">
        {exercise.instruction}
      </p>

      {/* Question Prompt (Used in MULTIPLE_CHOICE) */}
      {exercise.question && (
        <div className="mb-4 rounded-xl bg-slate-900/70 border border-slate-700/80 px-4 py-3 text-lg font-bold text-white">
          “{exercise.question}”
        </div>
      )}

      {/* Audio Replay Button (Used in LISTEN_* or whenever audioKey exists) */}
      {(exercise.audioKey ||
        exercise.type === "LISTEN_SENTENCE_BUILDER" ||
        exercise.type === "LISTEN_PICTURE_SELECTOR") && (
        <button
          type="button"
          onClick={() =>
            playExerciseAudio(exercise.audioKey, exercise.targetText)
          }
          className="mb-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition-colors active:scale-95"
        >
          <Volume2 size={18} className="text-indigo-400" />
          Listen to Audio
        </button>
      )}

      {/* Visual Timer Bar */}
      {message.status === "pending" && (
        <div className="w-full h-1.5 bg-slate-900 rounded-full mb-5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 linear ${
              timeLeft <= 5 ? "bg-rose-500" : "bg-amber-400"
            }`}
            style={{ width: `${(timeLeft / initialTime) * 100}%` }}
          />
        </div>
      )}

      {/* Mini-Games Container */}
      <div className="relative">
        {isCompleted && <div className="absolute inset-0 z-10 bg-transparent" />}

        {/* 1. MULTIPLE CHOICE */}
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

        {/* 2. SENTENCE BUILDER & LISTEN_SENTENCE_BUILDER */}
        {(exercise.type === "SENTENCE_BUILDER" ||
          exercise.type === "LISTEN_SENTENCE_BUILDER") && (
          <SentenceBuilder
            words={exercise.scrambledWords || []}
            expectedCount={expectedWordCount}
            onSubmit={(ans) => onSubmit(ans)}
          />
        )}

        {/* 3. LISTEN PICTURE SELECTOR (Imagen 2x2 Grid) */}
        {exercise.type === "LISTEN_PICTURE_SELECTOR" && (
          <PictureSelector
            options={exercise.imageOptions || []}
            resolveAssetUrl={resolveAssetUrl}
            onSubmit={(label) => onSubmit(label)}
          />
        )}

        {/* 4. PRONUNCIATION */}
        {exercise.type === "PRONUNCIATION" && (
          <PronunciationExercise
            target={exercise.targetText || ""}
            isRecording={isRecording}
            transcript={transcript}
            startRecording={startRecording}
            onPlayReference={() =>
              playExerciseAudio(exercise.audioKey, exercise.targetText)
            }
            onSubmit={(ans) => onSubmit(ans)}
          />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 1. SENTENCE BUILDER (Supports distractor words via expectedCount)
// ----------------------------------------------------------------------------
function SentenceBuilder({
  words,
  expectedCount,
  onSubmit,
}: {
  words: string[];
  expectedCount?: number;
  onSubmit: (ans: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>(words);

  const selectWord = (word: string, idx: number) => {
    setSelected((prev) => [...prev, word]);
    setAvailable((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeWord = (word: string, idx: number) => {
    setAvailable((prev) => [...prev, word]);
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  const requiredLength = expectedCount || words.length;
  const canSubmit = selected.length >= requiredLength;

  return (
    <div className="flex flex-col gap-4">
      {/* Drop Zone (Selected Words) */}
      <div className="min-h-[60px] p-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-900/50 flex flex-wrap gap-2 items-center">
        {selected.length === 0 && (
          <span className="text-slate-500 text-sm ml-2">
            Tap words below ({requiredLength} words needed)...
          </span>
        )}
        {selected.map((w, i) => (
          <button
            key={`sel-${i}`}
            onClick={() => removeWord(w, i)}
            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-sm active:scale-95 transition-transform font-medium"
          >
            {w}
          </button>
        ))}
      </div>

      {/* Word Bank (Available Words - includes distractors) */}
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
      {canSubmit && (
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
// 2. LISTEN PICTURE SELECTOR (Imagen 2x2 Grid)
// ----------------------------------------------------------------------------
function PictureSelector({
  options,
  resolveAssetUrl,
  onSubmit,
}: {
  options: ImageOption[];
  resolveAssetUrl: (key?: string | null) => string;
  onSubmit: (label: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {options.map((opt, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSubmit(opt.label)}
          className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-600 bg-slate-900/60 hover:border-indigo-500 hover:ring-2 hover:ring-indigo-500/40 transition-all active:scale-98 text-left"
        >
          <div className="aspect-square w-full overflow-hidden bg-slate-800">
            <img
              src={resolveAssetUrl(opt.imageKey)}
              alt={opt.label}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-2.5 text-center bg-slate-800/90 border-t border-slate-700">
            <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
              {opt.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 3. PRONUNCIATION EXERCISE
// ----------------------------------------------------------------------------
function PronunciationExercise({
  target,
  onSubmit,
  onPlayReference,
  isRecording,
  transcript,
  startRecording,
}: {
  target: string;
  onSubmit: (text: string) => void;
  onPlayReference: () => void;
  isRecording: boolean;
  transcript: string;
  startRecording: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex items-center gap-2">
        <div className="text-xl sm:text-2xl font-bold text-white">
          “{target}”
        </div>
        <button
          type="button"
          onClick={onPlayReference}
          className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 text-indigo-300 transition-colors"
          title="Listen to pronunciation"
        >
          <Volume2 size={18} />
        </button>
      </div>

      {!isRecording ? (
        <button
          type="button"
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

      {transcript && (
        <div className="mt-2 p-3 bg-slate-900/80 rounded-xl border border-slate-700 w-full">
          <p className="text-slate-300 text-sm">
            You said: <span className="text-white font-semibold">“{transcript}”</span>
          </p>
          <button
            type="button"
            onClick={() => onSubmit(transcript)}
            className="mt-3 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
          >
            Submit Audio
          </button>
        </div>
      )}
    </div>
  );
}