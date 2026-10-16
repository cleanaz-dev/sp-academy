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
    startRecording,
    playExerciseAudio,
    resolveAssetUrl,
  } = useBossFoundation();

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
    // Flex column that fills the exact height of the container
    <div className="flex flex-col w-full h-[calc(100vh-6rem)] min-h-[600px] max-w-5xl mx-auto bg-slate-50 rounded-3xl overflow-hidden shadow-xl border border-slate-200 relative">
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

      {/* 🎮 TOP STATS BAR */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col gap-3 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          {/* Avatar & Boss Name */}
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

          {/* Lives (Hearts) */}
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

          {/* XP Counter */}
          <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            <Zap size={18} className="text-amber-500 fill-amber-500" />
            <span className="text-amber-600 font-extrabold text-sm">
              {xp} XP
            </span>
          </div>
        </div>

        {/* Smooth Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 💬 CHAT / GAME AREA */}
      <div className="flex-1 overflow-hidden relative bg-[url('/noise.png')] bg-opacity-5">
        <ScrollArea className="h-full w-full px-4 sm:px-8 py-6">
          <div className="space-y-6 max-w-3xl mx-auto pb-4">
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
      {/* 🛑 BOTTOM ACTION BAR */}
      <div className="shrink-0 bg-white border-t border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row gap-4 relative z-10">
        {/* If the user hasn't clicked begin yet, ONLY show this big button */}
        {!hasStartedExercises ? (
          <button
            onClick={startExercises}
            className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-lg transition-all active:translate-y-1 active:border-b-0 border-b-4 border-indigo-800 shadow-sm animate-in slide-in-from-bottom-2 flex items-center justify-center"
          >
            {isProcessing ? "Skip Intro & Begin" : "I'm Ready, Let's Begin"}
          </button>
        ) : stageStatus === "PLAYING" ? (
          // If playing, show standard exercise controls
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
          // If Stage is Failed
          <div className="flex-1 flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest">
              Encounter {stageStatus}
            </p>
          </div>
        )}

        {/* If Stage is Passed */}
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

// ============================================================================
// EXERCISE RENDERER COMPONENT (LIGHT MODE PREMIUM)
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
}: any) {
  const exercise = message.exercise;
  const initialTime =
    exercise?.type === "PRONUNCIATION" || exercise?.type.includes("BUILDER")
      ? 25
      : 15;
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const isCompleted =
    message.status === "correct" || message.status === "incorrect";
  const isTimerPaused = isCompleted || isRecording || isAiProcessing;

  useEffect(() => {
    if (isTimerPaused || timeLeft <= 0) {
      if (timeLeft <= 0 && !isTimerPaused) onTimeOut();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimerPaused, onTimeOut]);

  if (!exercise) return null;

  return (
    <div
      className={`w-full max-w-[90%] md:max-w-[85%] rounded-3xl p-5 sm:p-6 border-2 transition-all duration-300 shadow-sm ${
        message.status === "correct"
          ? "bg-emerald-50 border-emerald-200 shadow-emerald-100"
          : message.status === "incorrect"
            ? "bg-rose-50 border-rose-200 shadow-rose-100"
            : "bg-white border-slate-200"
      }`}
    >
      {/* Header & Timer */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          {exercise.type.replace(/_/g, " ")}
        </span>

        {message.status === "correct" && (
          <CheckCircle2
            className="text-emerald-500 animate-in zoom-in"
            size={28}
          />
        )}
        {message.status === "incorrect" && (
          <XCircle className="text-rose-500 animate-in zoom-in" size={28} />
        )}
        {message.status === "pending" && (
          <div
            className={`flex items-center gap-1.5 font-bold ${timeLeft <= 5 ? "text-rose-500 animate-pulse" : "text-amber-500"}`}
          >
            <Clock size={18} /> {timeLeft}s
          </div>
        )}
      </div>

      <p className="text-slate-700 text-[15px] font-bold mb-4">
        {exercise.instruction}
      </p>

      {exercise.question && (
        <div className="mb-5 rounded-2xl bg-slate-50 border border-slate-200 px-5 py-4 text-lg font-extrabold text-slate-800 text-center">
          “{exercise.question}”
        </div>
      )}

      {(exercise.audioKey || exercise.type.includes("LISTEN")) && (
        <button
          type="button"
          onClick={() =>
            playExerciseAudio(exercise.audioKey, exercise.targetText)
          }
          className="mb-5 flex items-center justify-center w-full gap-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-3 text-sm font-extrabold text-indigo-600 transition-colors active:scale-95"
        >
          <Volume2 size={20} /> Listen to Audio
        </button>
      )}

      {/* Visual Timer Bar */}
      {message.status === "pending" && (
        <div className="w-full h-2 bg-slate-100 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 linear ${timeLeft <= 5 ? "bg-rose-500" : "bg-amber-400"}`}
            style={{ width: `${(timeLeft / initialTime) * 100}%` }}
          />
        </div>
      )}

      <div className="relative">
        {isCompleted && (
          <div className="absolute inset-0 z-10 bg-transparent" />
        )}

        {exercise.type === "MULTIPLE_CHOICE" && (
          <div className="flex flex-col gap-3">
            {exercise.options?.map((opt: string, i: number) => (
              <button
                key={i}
                onClick={() => onSubmit(opt)}
                className="w-full text-left px-5 py-4 rounded-2xl bg-white hover:bg-indigo-50 text-slate-700 font-bold transition-all border-2 border-slate-200 hover:border-indigo-400 active:translate-y-1 active:border-b-2 border-b-4"
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {(exercise.type === "SENTENCE_BUILDER" ||
          exercise.type === "LISTEN_SENTENCE_BUILDER") && (
          <SentenceBuilder
            words={exercise.scrambledWords || []}
            expectedCount={exercise.correctAnswer?.length}
            onSubmit={onSubmit}
          />
        )}

        {exercise.type === "LISTEN_PICTURE_SELECTOR" && (
          <PictureSelector
            options={exercise.imageOptions || []}
            resolveAssetUrl={resolveAssetUrl}
            onSubmit={onSubmit}
          />
        )}

        {exercise.type === "PRONUNCIATION" && (
          <PronunciationExercise
            target={exercise.targetText || ""}
            isRecording={isRecording}
            transcript={transcript}
            startRecording={startRecording}
            onPlayReference={() =>
              playExerciseAudio(exercise.audioKey, exercise.targetText)
            }
            onSubmit={onSubmit}
          />
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// 1. SENTENCE BUILDER
// ----------------------------------------------------------------------------
function SentenceBuilder({ words, expectedCount, onSubmit }: any) {
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
    <div className="flex flex-col gap-5">
      <div className="min-h-[70px] p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-wrap gap-2 items-center">
        {selected.length === 0 && (
          <span className="text-slate-400 font-medium text-sm ml-2">
            Tap words below...
          </span>
        )}
        {selected.map((w, i) => (
          <button
            key={i}
            onClick={() => removeWord(w, i)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-sm font-extrabold active:scale-95 transition-transform"
          >
            {w}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {available.map((w, i) => (
          <button
            key={i}
            onClick={() => selectWord(w, i)}
            className="px-4 py-2 bg-white text-slate-700 rounded-xl font-extrabold border-2 border-slate-200 border-b-4 hover:border-indigo-300 hover:bg-indigo-50 active:translate-y-1 active:border-b-2 transition-all"
          >
            {w}
          </button>
        ))}
      </div>

      {canSubmit && (
        <button
          onClick={() => onSubmit(selected)}
          className="mt-2 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 transition-all animate-in slide-in-from-bottom-2"
        >
          Check Answer
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 2. LISTEN PICTURE SELECTOR
// ----------------------------------------------------------------------------
function PictureSelector({ options, resolveAssetUrl, onSubmit }: any) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {options.map((opt: ImageOption, idx: number) => (
        <button
          key={idx}
          onClick={() => onSubmit(opt.label)}
          className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-500 hover:shadow-md transition-all active:scale-95 text-left"
        >
          <div className="aspect-square w-full overflow-hidden bg-slate-100">
            <img
              src={resolveAssetUrl(opt.imageKey)}
              alt={opt.label}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="p-3 text-center border-t-2 border-slate-100">
            <span className="text-[15px] font-extrabold text-slate-700 group-hover:text-indigo-600 transition-colors">
              {opt.label}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ----------------------------------------------------------------------------
// 3. PRONUNCIATION
// ----------------------------------------------------------------------------
function PronunciationExercise({
  target,
  onSubmit,
  onPlayReference,
  isRecording,
  transcript,
  startRecording,
}: any) {
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="text-xl sm:text-2xl font-extrabold text-slate-800">
          “{target}”
        </div>
        <button
          type="button"
          onClick={onPlayReference}
          className="p-2 rounded-full bg-slate-100 hover:bg-indigo-100 text-indigo-500 transition-colors"
        >
          <Volume2 size={20} />
        </button>
      </div>

      {!isRecording ? (
        <button
          type="button"
          onClick={startRecording}
          className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center border-b-4 border-indigo-700 hover:bg-indigo-400 active:translate-y-1 active:border-b-0 transition-all shadow-md"
        >
          <Mic className="text-white" size={32} />
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-rose-500 animate-pulse flex items-center justify-center shadow-lg shadow-rose-200">
            <Mic className="text-white" size={32} />
          </div>
          <p className="text-indigo-500 font-extrabold text-sm uppercase tracking-widest">
            Listening...
          </p>
        </div>
      )}

      {transcript && (
        <div className="mt-2 p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 w-full">
          <p className="text-slate-500 text-sm font-medium">
            You said:{" "}
            <span className="text-slate-800 font-extrabold">
              “{transcript}”
            </span>
          </p>
          <button
            type="button"
            onClick={() => onSubmit(transcript)}
            className="mt-4 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold rounded-2xl border-b-4 border-emerald-700 active:translate-y-1 active:border-b-0 transition-all"
          >
            Submit Audio
          </button>
        </div>
      )}
    </div>
  );
}
