"use client";

import { useState, useEffect } from "react";
import { Check, Mic, RotateCcw, Volume2 } from "lucide-react";

const MAX_RETRIES = 3;

interface PronunciationExerciseProps {
  target: string;
  onSubmit: () => void;
  onPlayReference: () => void;
  isRecording: boolean;
  transcript?: string;
  startRecording: () => void;
  stopRecording?: () => void;
  onReset: () => void;
  isCompleted?: boolean;
}

export function PronunciationExercise({
  target,
  onSubmit,
  onPlayReference,
  isRecording,
  transcript,
  startRecording,
  stopRecording,
  onReset,
  isCompleted = false,
}: PronunciationExerciseProps) {
  // Forces the UI into the Review (Retry / Submit) state immediately when "Done Speaking" is clicked
  const [isReviewing, setIsReviewing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Reset retry count & review state when moving to a new target phrase
  useEffect(() => {
    setIsReviewing(false);
    setRetryCount(0);
  }, [target]);

  // If recording stops naturally on its own and we have a transcript, move to review state
  useEffect(() => {
    if (!isRecording && transcript) {
      setIsReviewing(true);
    }
  }, [isRecording, transcript]);

  const handleStartRecording = () => {
    setIsReviewing(false);
    startRecording();
  };

  const handleDoneSpeaking = () => {
    setIsReviewing(true); // Immediately show Retry / Submit UI
    stopRecording?.();
  };

  const handleRetry = () => {
    if (retryCount >= MAX_RETRIES) return;
    setRetryCount((prev) => prev + 1);
    setIsReviewing(false);
    stopRecording?.();
    onReset();
  };

  const retriesRemaining = MAX_RETRIES - retryCount;
  const showRecordingState = isRecording && !isReviewing && !isCompleted;
  const showReviewState = Boolean(transcript) && (isReviewing || !isRecording);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      {/* Target Word / Phrase */}
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

      {/* 1. Initial State: Start Recording */}
      {!showRecordingState && !showReviewState && !isCompleted && (
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleStartRecording}
            className="flex h-20 w-20 items-center justify-center rounded-full border-b-4 border-indigo-700 bg-indigo-500 shadow-md transition-all hover:bg-indigo-400 active:translate-y-1 active:border-b-0"
            aria-label="Start recording"
          >
            <Mic className="text-white" size={32} />
          </button>
          {retryCount > 0 && (
            <p className="text-xs font-semibold text-slate-400">
              Attempt {retryCount + 1} of {MAX_RETRIES + 1}
            </p>
          )}
        </div>
      )}

      {/* 2. Recording State: Pulse Mic, Live Text, and Done Speaking Button */}
      {showRecordingState && (
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex h-20 w-20 animate-pulse items-center justify-center rounded-full bg-rose-500 shadow-lg shadow-rose-200">
            <Mic className="text-white" size={32} />
          </div>

          <p className="text-xs font-extrabold uppercase tracking-widest text-indigo-500">
            Listening...
          </p>

          {transcript ? (
            <div className="w-full max-w-sm rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-2.5 text-base font-semibold text-indigo-900 transition-all">
              “{transcript}”
            </div>
          ) : (
            <p className="text-xs text-slate-400">Speak now...</p>
          )}

          {transcript && (
            <button
              type="button"
              onClick={handleDoneSpeaking}
              className="mt-2 flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border-b-4 border-indigo-700 bg-indigo-500 py-3 font-extrabold text-white shadow-md transition-all hover:bg-indigo-400 active:translate-y-1 active:border-b-0"
            >
              <Check size={20} />
              Done Speaking
            </button>
          )}
        </div>
      )}

      {/* 3. Review (Retry / Submit) & Completed State */}
      {showReviewState && (
        <div className="mt-2 w-full animate-in rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 duration-300 zoom-in-95">
          <p
            className={`text-sm font-medium text-slate-500 ${
              isCompleted ? "mb-0" : "mb-4"
            }`}
          >
            Heard:{" "}
            <span className="text-[15px] font-extrabold text-slate-800">
              “{transcript}”
            </span>
          </p>

          {!isCompleted && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {retriesRemaining > 0 && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white py-3.5 font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-800 active:translate-y-1"
                  >
                    <RotateCcw size={16} />
                    Retry ({retriesRemaining} left)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    stopRecording?.();
                    onSubmit();
                  }}
                  className="flex-1 rounded-xl border-b-4 border-emerald-700 bg-emerald-500 py-3.5 font-extrabold text-white transition-all hover:bg-emerald-400 active:translate-y-1 active:border-b-0"
                >
                  Submit
                </button>
              </div>

              {retriesRemaining === 0 && (
                <p className="text-xs font-semibold text-amber-600">
                  No retries remaining — please submit your answer.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}