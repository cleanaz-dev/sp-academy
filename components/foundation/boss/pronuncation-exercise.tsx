"use client";

import { Mic, Volume2 } from "lucide-react";

interface PronunciationExerciseProps {
  target: string;
  onSubmit: () => void;
  onPlayReference: () => void;
  isRecording: boolean;
  transcript?: string;
  startRecording: () => void;
  onReset: () => void;
}

export function PronunciationExercise({
  target,
  onSubmit,
  onPlayReference,
  isRecording,
  transcript,
  startRecording,
  onReset,
}: PronunciationExerciseProps) {

  console.log("Transcript:", transcript)
  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="text-xl font-extrabold text-slate-800 sm:text-2xl">
          “{target}”
        </div>

        <button
          type="button"
          onClick={onPlayReference}
          className="rounded-full bg-slate-100 p-2 text-indigo-500 transition-colors hover:bg-indigo-100"
          aria-label="Play reference audio"
        >
          <Volume2 size={20} />
        </button>
      </div>

      {!isRecording && !transcript ? (
        <button
          type="button"
          onClick={startRecording}
          className="flex h-20 w-20 items-center justify-center rounded-full border-b-4 border-indigo-700 bg-indigo-500 shadow-md transition-all hover:bg-indigo-400 active:translate-y-1 active:border-b-0"
          aria-label="Start recording"
        >
          <Mic className="text-white" size={32} />
        </button>
      ) : isRecording ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-rose-500 shadow-lg shadow-rose-200">
            <Mic className="text-white" size={32} />
          </div>

          <p className="text-sm font-extrabold uppercase tracking-widest text-indigo-500">
            Listening...
          </p>
        </div>
      ) : null}

      {transcript && !isRecording && (
        <div className="mt-2 w-full animate-in rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 duration-300 zoom-in-95">
          <p className="mb-4 text-sm font-medium text-slate-500">
            Heard:{" "}
            <span className="text-[15px] font-extrabold text-slate-800">
              “{transcript}”
            </span>
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReset}
              className="flex-1 rounded-xl border-2 border-slate-200 bg-white py-3.5 font-bold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-700 active:translate-y-1"
            >
              Retry Mic
            </button>

            <button
              type="button"
              onClick={onSubmit}
              className="flex-1 rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-3.5 font-extrabold text-white transition-all hover:bg-emerald-400 active:translate-y-1 active:border-b-0"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}