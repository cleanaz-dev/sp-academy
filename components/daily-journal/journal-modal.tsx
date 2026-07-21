"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useSpeech, LANGUAGES } from "@/context/speech-context"

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

  const [isSaving, setIsSaving] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop recording and send data to your Lambda / Backend endpoint
  const handleStopAndSave = async () => {
    setIsSaving(true);
    try {
      const audioBlob = await stopRecording();

      if (!audioBlob) {
        alert("No audio captured.");
        setIsSaving(false);
        return;
      }

      // Build payload for Lambda (S3 Upload + Azure Pronunciation Score)
      const formData = new FormData();
      formData.append("audio", audioBlob, `journal-${date?.toISOString()}.webm`);
      formData.append("transcript", transcript);
      formData.append("language", language);
      if (date) formData.append("date", date.toISOString());

      console.log("Ready for Lambda Submission:", {
        audioBlob,
        transcript,
        language,
        date,
      });

      // TODO: Replace with your actual endpoint call
      // const res = await fetch("/api/your-lambda-endpoint", {
      //   method: "POST",
      //   body: formData,
      // });
      // if (!res.ok) throw new Error("Failed to save entry");

      if (onSaveSuccess) onSaveSuccess();
      handleClose();
    } catch (err) {
      console.error("Error saving journal entry:", err);
      alert("Failed to save journal entry. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = async () => {
    if (isRecording) {
      await stopRecording();
    }
    resetSpeechState();
    onClose();
  };

  // Canvas Audio Visualizer tied to audioStream from SpeechContext
  useEffect(() => {
    if (!isRecording || !audioStream || !canvasRef.current) return;

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
  }, [isRecording, audioStream]);

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
            disabled={isSaving}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Close
          </button>
        </div>

        {/* Existing Entry Indicator */}
        <div className="mb-3">
          {existingEntry && !isRecording ? (
            <p className="text-sm font-medium text-emerald-600">
              ✓ You have a journal entry for this day. Record to create a new entry or update.
            </p>
          ) : (
            <p className="text-sm text-gray-500">Record your verbal journal below.</p>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Language Picker */}
        <div className="mb-4 flex justify-center gap-2">
          {Object.entries(LANGUAGES).map(([code, label]) => (
            <button
              key={code}
              disabled={isRecording || isSaving}
              onClick={() => setLanguage(code)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                language === code
                  ? "border-2 border-emerald-500 bg-emerald-50 text-emerald-800"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              } ${isRecording || isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Live Transcript / Teleprompter Display */}
        <div className="mb-4 flex min-h-[120px] max-h-[200px] overflow-y-auto items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-4 text-center text-lg font-medium text-gray-700 bg-gray-50">
          {transcript || (isRecording ? "Listening..." : "Press record to start speaking!")}
        </div>

        {/* Audio Visualizer Canvas & Action Button */}
        <div className="flex flex-col items-center gap-4">
          <canvas
            ref={canvasRef}
            width={400}
            height={50}
            className="w-full rounded-lg bg-gray-100"
          />

          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isSaving}
              className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-red-600 disabled:opacity-50"
            >
              🔴 Start Recording
            </button>
          ) : (
            <button
              onClick={handleStopAndSave}
              disabled={isSaving}
              className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "⏹ Stop & Save"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}