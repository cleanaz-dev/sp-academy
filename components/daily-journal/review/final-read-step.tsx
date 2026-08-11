"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, CheckCircle2 } from "lucide-react";

interface FinalReadStepProps {
  improvedTranscript: string;
  isRecording: boolean;
  activeRecordingTarget: string | null;
  practiceCompleted: boolean;
  score: any;
  error: string | null;
  handlePracticeToggle: () => void;
}

export default function FinalReadStep({
  improvedTranscript, isRecording, activeRecordingTarget, practiceCompleted, score, error, handlePracticeToggle
}: FinalReadStepProps) {
  const isRecordingFull = isRecording && activeRecordingTarget === "full";
  const hasFullScore = score && activeRecordingTarget === "full";

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-5xl mx-auto w-full space-y-8">
      
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-8 shadow-sm text-center">
        <span className="mb-4 inline-block rounded bg-indigo-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">Full Transcript</span>
        <p className="text-3xl font-medium text-indigo-950 mt-4 mb-4 leading-relaxed">{improvedTranscript}</p>
      </div>

      <div className={`rounded-2xl border p-10 text-center shadow-sm flex flex-col items-center justify-center transition-all duration-500 ${
        !practiceCompleted && !isRecordingFull ? "border-sky-300 bg-sky-100/50 shadow-[0_0_30px_rgba(56,189,248,0.1)]" : "border-gray-100 bg-white"
      }`}>
         <p className="mb-8 text-lg font-medium text-gray-600">
           {isRecordingFull 
            ? "Listening to you... Read the text aloud." 
            : practiceCompleted 
              ? "Great job! Review your final score below." 
              : "Read the entire transcript aloud using the mic button below to finish."}
         </p>

         <button 
            onClick={handlePracticeToggle} 
            className={`relative z-10 flex h-24 w-24 shrink-0 items-center justify-center rounded-full shadow-lg transition-all duration-300 ${
              isRecordingFull 
                ? "bg-red-500 text-white animate-[pulse_1.5s_ease-in-out_infinite] ring-8 ring-red-500/30"
              : practiceCompleted 
                ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
              : "bg-sky-500 text-white shadow-[0_0_25px_rgba(14,165,233,0.4)] hover:bg-sky-600 hover:scale-105"
            }`}
          >
            {practiceCompleted && !isRecordingFull ? <CheckCircle2 className="h-12 w-12" /> : <Mic className="h-12 w-12" />}
          </button>
         
         {error && activeRecordingTarget === "full" && (
           <div className="mt-8 text-base text-red-500 bg-red-50 p-4 rounded-xl border border-red-200">
             {error}
           </div>
         )}

         <AnimatePresence>
             {hasFullScore && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 w-full max-w-3xl flex flex-col items-center">
                    <div className="flex gap-4 mb-8 w-full justify-center">
                      <div className="flex flex-col items-center p-5 bg-white rounded-2xl shadow-sm border border-sky-100 min-w-[120px]">
                        <span className="text-4xl font-black text-sky-600">{score.pronunciationScore}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase mt-2 tracking-wider">Pronunciation</span>
                      </div>
                      <div className="flex flex-col items-center p-5 bg-white rounded-2xl shadow-sm border border-sky-100 min-w-[120px]">
                        <span className="text-4xl font-black text-sky-600">{score.accuracyScore}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase mt-2 tracking-wider">Accuracy</span>
                      </div>
                      <div className="flex flex-col items-center p-5 bg-white rounded-2xl shadow-sm border border-sky-100 min-w-[120px]">
                        <span className="text-4xl font-black text-sky-600">{score.fluencyScore}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase mt-2 tracking-wider">Fluency</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-sky-200 bg-white p-8 text-2xl flex flex-wrap justify-center gap-x-2.5 gap-y-2 shadow-sm leading-relaxed">
                      {score.words.map((w: any, i: number) => (
                        <span 
                          key={i} 
                          className={`font-medium transition-colors ${w.accuracyScore >= 80 ? "text-emerald-600" : w.accuracyScore >= 60 ? "text-yellow-500" : "text-red-500 underline underline-offset-4 decoration-red-300"}`}
                          title={`Accuracy: ${w.accuracyScore}%`}
                        >
                          {w.word}
                        </span>
                      ))}
                    </div>
                 </motion.div>
             )}
         </AnimatePresence>
      </div>
    </motion.div>
  );
}