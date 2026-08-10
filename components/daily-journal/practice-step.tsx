"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Mic, Quote } from "lucide-react";
import { usePronunciation } from "@/context/pronunciation-context";
import { useEffect } from "react";

interface PracticeStepProps {
  stepNumber: string;
  referenceText: string;
  azureLocale: string;
  canRecord: boolean;
  onComplete: (didComplete: boolean) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  return "text-red-600 bg-red-50 border-red-200";
};

const wordColor = (errorType: string, accuracyScore: number) => {
  if (errorType === "Omission") return "text-gray-400 line-through";
  if (errorType === "Insertion") return "text-purple-500 italic";
  if (accuracyScore < 60) return "text-red-600 font-bold";
  if (accuracyScore < 85) return "text-yellow-600 font-semibold";
  return "text-emerald-700";
};

export default function PracticeStep({ stepNumber, referenceText, azureLocale, canRecord, onComplete }: PracticeStepProps) {
  const { isRecording, score, error, assessSpeech, cancelAssessment, reset } = usePronunciation();

  const completed = !!score && !isRecording;
  const timeToRecord = canRecord && !completed && !isRecording;

  useEffect(() => {
    onComplete(completed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completed]);

  useEffect(() => {
    return () => cancelAssessment();
  }, [cancelAssessment]);

  const handleToggle = async () => {
    if (isRecording) return; // auto-stops on silence
    reset();
    await assessSpeech(referenceText, azureLocale);
  };

  const mispronounced = (score?.words || []).filter((w) => w.errorType !== "None");

  return (
    <section className={`space-y-4 transition-opacity duration-500 ${canRecord ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
          {stepNumber}
        </span>
        <h3 className="text-lg font-bold text-gray-800">Try it out</h3>
      </div>

      <div
        className={`rounded-2xl border p-6 shadow-sm flex flex-col items-center justify-center min-h-[180px] transition-all duration-500 ${
          timeToRecord ? "border-sky-300 bg-sky-100/50 shadow-[0_0_20px_rgba(56,189,248,0.15)]" : "border-sky-100 bg-sky-50"
        }`}
      >
        <p className={`mb-4 text-sm font-medium text-center ${timeToRecord ? "text-sky-900" : "text-sky-800"}`}>
          {isRecording
            ? "Listening... read the sentence aloud, we'll stop automatically."
            : completed
            ? "Nice work! Here's how you did:"
            : "Read the improved transcript aloud using the mic button below to practice."}
        </p>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 w-full max-w-lg rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm"
            >
              <AlertCircle className="h-4 w-4 shrink-0" /> {error}
            </motion.div>
          )}

          {!error && score && (
            <motion.div
              key="score"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-lg rounded-xl border border-sky-200 bg-white p-4 shadow-sm text-left"
            >
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { label: "Overall", value: score.pronunciationScore },
                  { label: "Accuracy", value: score.accuracyScore },
                  { label: "Fluency", value: score.fluencyScore },
                  { label: "Complete", value: score.completenessScore },
                ].map((s) => (
                  <div key={s.label} className={`flex flex-col items-center justify-center p-2 rounded-lg border ${getScoreColor(s.value)}`}>
                    <span className="text-lg font-black">{Math.round(s.value)}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Word-by-word readback, color coded */}
              <p className="text-base leading-relaxed mb-3">
                {score.words.map((w, i) => (
                  <span key={i} className={`mx-0.5 ${wordColor(w.errorType, w.accuracyScore)}`} title={`${w.errorType} — ${Math.round(w.accuracyScore)}%`}>
                    {w.word}
                  </span>
                ))}
              </p>

              {mispronounced.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                  {mispronounced.map((w, i) => (
                    <span key={i} className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-100 shadow-sm">
                      {w.word} <span className="opacity-50 text-[10px]">({w.errorType})</span>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-400 italic flex items-start gap-1 mt-3">
                <Quote className="w-3 h-3 mt-0.5 shrink-0" /> Heard: "{score.recognizedText}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={handleToggle}
        disabled={!canRecord || isRecording}
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${
          isRecording
            ? "bg-red-500 text-white animate-[pulse_1.5s_ease-in-out_infinite] ring-4 ring-red-500/30"
            : completed
            ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
            : !canRecord
            ? "bg-gray-100 text-gray-300 cursor-not-allowed"
            : "bg-sky-500 hover:bg-sky-600 hover:scale-105 text-white"
        }`}
      >
        {completed ? <CheckCircle2 className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
      </button>
    </section>
  );
}