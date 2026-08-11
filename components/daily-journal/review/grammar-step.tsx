"use client";

import { motion } from "framer-motion";
import { AlertCircle, Mic, CheckCircle2 } from "lucide-react";

interface GrammarStepProps {
  grammarSuggestions: any[];
  actionedCards: Set<string>;
  handlePracticeCard: (id: string, text: string) => void;
  handleCardAcknowledge: (id: string) => void;
  isRecording: boolean;
  activeRecordingTarget: string | null;
  cardScores: Record<string, any>;
  error: string | null;
}

export default function GrammarStep({
  grammarSuggestions, actionedCards, handlePracticeCard, handleCardAcknowledge,
  isRecording, activeRecordingTarget, cardScores, error
}: GrammarStepProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-5xl mx-auto w-full space-y-6">
      <div className="grid gap-6">
        {grammarSuggestions.map((item: any) => {
          const isActioned = actionedCards.has(item.id);
          const isRecordingThis = isRecording && activeRecordingTarget === item.id;
          const cardScore = cardScores[item.id];
          const cardError = error && activeRecordingTarget === item.id;

          return (
            <div key={item.id} className={`flex flex-col gap-6 rounded-2xl border p-6 shadow-sm transition-all md:flex-row md:items-center md:justify-between ${isActioned ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200 bg-white"}`}>
              
              <div className="flex-1 space-y-4">
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-base font-medium text-red-500 line-through mb-1">{item.original}</p>
                      
                      {cardScore ? (
                          <div className="mt-3 flex flex-wrap gap-x-2 gap-y-1 text-xl shadow-sm bg-white p-4 rounded-xl border border-emerald-100 inline-flex">
                            {cardScore.words.map((w: any, i: number) => (
                              <span key={i} className={`font-semibold ${w.accuracyScore >= 80 ? "text-emerald-600" : w.accuracyScore >= 60 ? "text-yellow-500" : "text-red-500 underline decoration-red-300"}`}>
                                {w.word}
                              </span>
                            ))}
                          </div>
                      ) : (
                          <p className="mt-1 text-xl font-semibold text-emerald-700">{item.improved}</p>
                      )}
                    </div>
                </div>
                
                <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                    <p className="text-sm text-gray-600 leading-relaxed">{item.explanation}</p>
                </div>

                {cardError && (
                  <p className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">Error: {error}</p>
                )}
              </div>

              <div className="shrink-0 md:pl-8 flex flex-col items-center gap-4 w-full md:w-auto md:min-w-[200px]">
                <button 
                  onClick={() => handlePracticeCard(item.id, item.improved)}
                  disabled={isRecording && !isRecordingThis}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-base font-bold transition-all ${
                    isRecordingThis 
                      ? "bg-red-500 text-white animate-pulse shadow-md ring-4 ring-red-500/20" 
                      : cardScore 
                        ? "bg-emerald-100 text-emerald-700 cursor-default"
                        : "bg-sky-500 text-white shadow-sm hover:bg-sky-600 hover:-translate-y-0.5"
                  } ${(isRecording && !isRecordingThis) ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isRecordingThis ? (
                    <><Mic className="h-5 w-5" /> Listening...</>
                  ) : cardScore ? (
                    <><CheckCircle2 className="h-5 w-5" /> Score: {cardScore.pronunciationScore}%</>
                  ) : (
                    <><Mic className="h-5 w-5" /> Practice Phrase</>
                  )}
                </button>

                {!cardScore && !isActioned && (
                  <button onClick={() => handleCardAcknowledge(item.id)} className="text-sm font-medium text-gray-400 hover:text-gray-600 hover:underline transition-colors">
                    Skip & Acknowledge
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}