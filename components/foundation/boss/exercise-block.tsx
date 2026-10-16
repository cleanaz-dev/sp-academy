"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Volume2, XCircle } from "lucide-react";

import type { BossMessage } from "@/context/boss-context";
import { PictureSelector } from "./picture-selector";
import { PronunciationExercise } from "./pronuncation-exercise";
import { SentenceBuilder } from "./sentence-builder";

interface ExerciseBlockProps {
  message: BossMessage;
  onSubmit: (answer: unknown) => void;
  onSubmitVoice: () => void;
  onTimeOut: () => void;
  isRecording: boolean;
  isAiProcessing: boolean;
  transcript?: string;
  startRecording: () => void;
  resetRecording: () => void;
  playExerciseAudio: (
    audioKey?: string,
    targetText?: string,
  ) => void | Promise<void>;
  resolveAssetUrl: (key: string) => string;
  playWord?: (phrase: string, gender?: "m" | "f") => Promise<void>;
  stopWordAudio?: () => void;
}



export function ExerciseBlock({
  message,
  onSubmit,
  onTimeOut,
  isRecording,
  isAiProcessing,
  transcript,
  startRecording,
  playExerciseAudio,
  resolveAssetUrl,
  onSubmitVoice,
  playWord,
  stopWordAudio,
  resetRecording,
}: ExerciseBlockProps) {

  // console.log("[ExerciseBlock] playWord prop:", typeof playWord, "type:", message.exercise?.type);
  
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
    setTimeLeft(initialTime);
  }, [message.id, initialTime]);

  useEffect(() => {
    if (isTimerPaused || timeLeft <= 0) {
      if (timeLeft <= 0 && !isTimerPaused) {
        onTimeOut();
      }

      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timeLeft, isTimerPaused, onTimeOut]);

  if (!exercise) {
    return null;
  }

  return (
    <div
      className={`w-full max-w-[90%] rounded-3xl border-2 p-5 shadow-sm transition-all duration-300 sm:p-6 md:max-w-[85%] ${
        message.status === "correct"
          ? "border-emerald-200 bg-emerald-50 shadow-emerald-100"
          : message.status === "incorrect"
            ? "border-rose-200 bg-rose-50 shadow-rose-100"
            : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
          {exercise.type.replace(/_/g, " ")}
        </span>

        {message.status === "correct" && (
          <CheckCircle2
            className="animate-in text-emerald-500 zoom-in"
            size={28}
          />
        )}

        {message.status === "incorrect" && (
          <XCircle className="animate-in text-rose-500 zoom-in" size={28} />
        )}

        {message.status === "pending" && (
          <div
            className={`flex items-center gap-1.5 font-bold ${
              timeLeft <= 5 ? "animate-pulse text-rose-500" : "text-amber-500"
            }`}
          >
            <Clock size={18} />
            {timeLeft}s
          </div>
        )}
      </div>

      <p className="mb-4 text-[15px] font-bold text-slate-700">
        {exercise.instruction}
      </p>

      {exercise.question && (
        <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-lg font-extrabold text-slate-800">
          “{exercise.question}”
        </div>
      )}

      {(exercise.audioKey || exercise.type.includes("LISTEN")) && (
        <button
          type="button"
          onClick={() =>
            playExerciseAudio(
              exercise.audioKey ?? undefined,
              exercise.targetText ?? undefined,
            )
          }
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm font-extrabold text-indigo-600 transition-colors hover:bg-indigo-100 active:scale-95"
        >
          <Volume2 size={20} />
          Listen to Audio
        </button>
      )}

      {message.status === "pending" && (
        <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeLeft <= 5 ? "bg-rose-500" : "bg-amber-400"
            }`}
            style={{
              width: `${Math.max(0, (timeLeft / initialTime) * 100)}%`,
            }}
          />
        </div>
      )}

      <div className="relative">
        {isCompleted && (
          <div
            className="absolute inset-0 z-10 bg-transparent"
            aria-hidden="true"
          />
        )}

        {exercise.type === "MULTIPLE_CHOICE" && (
          <div className="flex flex-col gap-3">
            {exercise.options?.map((option: string, index: number) => (
              <button
                key={`${option}-${index}`}
                type="button"
                onClick={() => onSubmit(option)}
                className="w-full rounded-2xl border-2 border-b-4 border-slate-200 bg-white px-5 py-4 text-left font-bold text-slate-700 transition-all hover:border-indigo-400 hover:bg-indigo-50 active:translate-y-1 active:border-b-2"
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {(exercise.type === "SENTENCE_BUILDER" ||
          exercise.type === "LISTEN_SENTENCE_BUILDER") && (
          <SentenceBuilder
            words={exercise.scrambledWords ?? []}
            expectedCount={exercise.correctAnswer?.length}
            onSubmit={onSubmit}
            playWord={playWord}
            stopWordAudio={stopWordAudio}
          />
        )}

        {exercise.type === "LISTEN_PICTURE_SELECTOR" && (
          <PictureSelector
            options={exercise.imageOptions ?? []}
            resolveAssetUrl={resolveAssetUrl}
            onSubmit={onSubmit}
            playWord={playWord}
            stopWordAudio={stopWordAudio}
          />
        )}

        {exercise.type === "PRONUNCIATION" && (
          <PronunciationExercise
            target={exercise.targetText ?? ""}
            isRecording={isRecording}
            transcript={transcript}
            startRecording={startRecording}
            onReset={resetRecording}
            onPlayReference={() =>
              playExerciseAudio(
                exercise.audioKey ?? undefined,
                exercise.targetText ?? undefined,
              )
            }
            onSubmit={onSubmitVoice}
          />
        )}
      </div>
    </div>
  );
}
