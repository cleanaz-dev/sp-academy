"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useSpeech, LANGUAGES } from "@/context/speech-context";

interface JournalModalProps {
  date: Date | null;
  onClose: () => void;
  existingEntry: any;
  onSaveSuccess?: () => void;
}

export default function JournalModal({
  date,
  onClose,
  existingEntry,
  onSaveSuccess,
}: JournalModalProps) {
  const {
    language,
    setLanguage,
    isRecording,
    transcript,
    audioStream,
    error,
    startRecording,
    stopRecording,
    resetSpeechState,
  } = useSpeech();

  // Modal local state: "idle" | "recording" | "review" | "saving"
  const [modalState, setModalState] = useState<"idle" | "recording" | "review" | "saving">("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Handle Start Recording
  const handleStartRecording = async () => {
    handleRetry(); // Reset previous recording if any
    setModalState("recording");
    await startRecording();
  };

  // 2. Handle Stop Recording -> Enter Review State
  const handleStopRecording = async () => {
    const blob = await stopRecording();
    if (blob) {
      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioPreviewUrl(url);
      setModalState("review");
    } else {
      setModalState("idle");
    }
  };

  // 3. Handle Retry -> Reset state back to idle
  const handleRetry = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl); // Clean up memory
    }
    setAudioBlob(null);
    setAudioPreviewUrl(null);
    resetSpeechState();
    setModalState("idle");
  };

  // 4. Handle Complete & Save -> Submit to API Endpoint
  const handleCompleteAndSave = async () => {
    if (!audioBlob) return;

    setModalState("saving");
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, `journal-${date?.toISOString()}.webm`);
      formData.append("transcript", transcript);
      formData.append("language", language);
      if (date) formData.append("entryDate", date.toISOString());

      const res = await fetch("/api/daily-journal/record", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to save journal entry.");
      }

      if (onSaveSuccess) onSaveSuccess();
      handleClose();
    } catch (err: any) {
      console.error("Error saving entry:", err);
      alert(err.message || "Failed to save entry. Please try again.");
      setModalState("review");
    }
  };

  const handleClose = async () => {
    if (isRecording) {
      await stopRecording();
    }
    handleRetry();
    onClose();
  };

  // Canvas Visualizer (Active during "recording" state)
  useEffect(() => {
    if (modalState !== "recording" || !audioStream || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioCtx();

    const source = audioCtx.createMediaStreamSource(audioStream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let animationFrameId: number;

    const renderFrame = () => {
      animationFrameId = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 2;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = dataArray[i] / 3;
        ctx.fillStyle = "#10b981"; // emerald-500
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 2;
      }
    };

    renderFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
      audioCtx.close();
    };
  }, [modalState, audioStream]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {date?.toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
          </h3>
          <button
            onClick={handleClose}
            disabled={modalState === "saving"}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Close
          </button>
        </div>

        {/* Existing Entry / Instructions */}
        <div className="mb-3">
          {existingEntry && modalState === "idle" ? (
            <p className="text-sm font-medium text-emerald-600">
              ✓ Journal entry completed for this day. Re-record below to update.
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              {modalState === "review"
                ? "Listen to your recording or try again before completing."
                : "Record your verbal journal entry below."}
            </p>
          )}
        </div>

        {/* Error Message Banner */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Language Selection */}
        <div className="mb-4 flex justify-center gap-2">
          {Object.entries(LANGUAGES).map(([code, label]) => (
            <button
              key={code}
              disabled={modalState !== "idle"}
              onClick={() => setLanguage(code)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                language === code
                  ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-800"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              } ${modalState !== "idle" ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Teleprompter / Transcript Area */}
        <div className="mb-4 flex min-h-[120px] max-h-[180px] overflow-y-auto items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center text-lg font-medium text-gray-700">
          {transcript ||
            (modalState === "recording"
              ? "Listening..."
              : "Press Record to start speaking!")}
        </div>

        {/* Audio Player Preview (Review Mode) */}
        {modalState === "review" && audioPreviewUrl && (
          <div className="mb-4 w-full rounded-lg bg-emerald-50 p-3 border border-emerald-200">
            <p className="mb-2 text-xs font-semibold text-emerald-800">🎧 Audio Playback Preview:</p>
            <audio src={audioPreviewUrl} controls className="w-full h-10" />
          </div>
        )}

        {/* Audio Visualizer Canvas (Recording Mode) */}
        {modalState === "recording" && (
          <canvas
            ref={canvasRef}
            width={400}
            height={40}
            className="mb-4 w-full rounded-lg bg-gray-100"
          />
        )}

        {/* Dynamic Action Controls */}
        <div className="mt-2 flex justify-center gap-3">
          {/* STATE 1: IDLE */}
          {modalState === "idle" && (
            <button
              onClick={handleStartRecording}
              className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-red-600"
            >
              🔴 Start Recording
            </button>
          )}

          {/* STATE 2: RECORDING */}
          {modalState === "recording" && (
            <button
              onClick={handleStopRecording}
              className="rounded-full bg-gray-800 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-gray-900"
            >
              ⏹ Stop Recording
            </button>
          )}

          {/* STATE 3: REVIEW (PLAYBACK & RETRY) */}
          {modalState === "review" && (
            <>
              <button
                onClick={handleRetry}
                className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
              >
                🔄 Retry
              </button>
              <button
                onClick={handleCompleteAndSave}
                className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
              >
                ✅ Complete & Save
              </button>
            </>
          )}

          {/* STATE 4: SAVING */}
          {modalState === "saving" && (
            <button
              disabled
              className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white opacity-70 cursor-wait"
            >
              💾 Saving Journal...
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}