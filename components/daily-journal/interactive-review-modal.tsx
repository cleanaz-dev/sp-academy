"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSpeech } from "@/context/speech-context";
import { useSpeak } from "@/hooks/use-speak"; // <-- NEW HOOK
import {
  X, Volume2, CheckCircle2, AlertCircle, Mic, ArrowRight, Sparkles, Loader2
} from "lucide-react";

// MOCK DATA: Represents what your Lambda returns in journal.review
const MOCK_REVIEW_DATA = {
  originalTranscript: "Me gusto ir al playa por el clima ser perfecto.",
  improvedTranscript: "Me gusta mucho ir a la playa porque el clima es perfecto.",
  nativeTranslation: "I really like going to the beach because the weather is perfect.",
  targetLanguage: "es", 
  grammarSuggestions: [
    {
      id: "1",
      original: "Me gusto ir al playa...",
      improved: "Me gusta mucho ir a la playa...",
      explanation: "In Spanish, 'playa' is feminine, so use 'la' instead of 'al'. Also, use 'me gusta' for present tense.",
    },
    {
      id: "2",
      original: "...por el clima ser perfecto.",
      improved: "...porque el clima es perfecto.",
      explanation: "To say 'because', use 'porque' followed by a conjugated verb ('es'), rather than 'por' + infinitive.",
    },
  ],
};

interface InteractiveReviewModalProps {
  onClose: () => void;
  onComplete: () => void;
  journal: any; // The journal entry from your DB
}

export default function InteractiveReviewModal({ onClose, onComplete, journal }: InteractiveReviewModalProps) {
  const { startRecording, stopRecording, isRecording, transcript } = useSpeech();
  const { speak, stop, isPlaying, isLoading } = useSpeak(); // <-- DEEPGRAM TTS
  
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [actionedCards, setActionedCards] = useState<Set<string>>(new Set());
  const [practiceCompleted, setPracticeCompleted] = useState(false);

  const allCardsActioned = actionedCards.size === MOCK_REVIEW_DATA.grammarSuggestions.length;
  const isReviewComplete = hasPlayedAudio && allCardsActioned && practiceCompleted;

  // Play High-Quality AI Voice
  const handlePlayImprovedAudio = async () => {
    setHasPlayedAudio(true); // Unlock next step immediately
    await speak(MOCK_REVIEW_DATA.improvedTranscript, MOCK_REVIEW_DATA.targetLanguage);
  };

  const handleCardAcknowledge = (id: string) => {
    setActionedCards((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  const handlePracticeToggle = async () => {
    if (isRecording) {
      await stopRecording();
      setPracticeCompleted(true);
    } else {
      await startRecording(MOCK_REVIEW_DATA.targetLanguage);
    }
  };

  // Cleanup audio if modal closes
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 overflow-y-auto">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Journal Review</h2>
            <p className="text-xs font-medium text-gray-500">
              Complete all actions to unlock your next journal.
            </p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
          <X className="h-6 w-6" />
        </button>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-10 p-6 pb-32">
        {/* STEP 1: Listen & Compare */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
            <h3 className="text-lg font-bold text-gray-800">Listen & Compare</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className="mb-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-500">What you said</span>
              <p className="text-lg text-gray-600 line-through decoration-red-400/50 decoration-2">
                {MOCK_REVIEW_DATA.originalTranscript}
              </p>
            </div>

            <div className="relative rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-5 shadow-sm">
              <span className="mb-2 inline-block rounded bg-indigo-200 px-2 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">How a native says it</span>
              <p className="mb-4 text-xl font-medium text-indigo-950">
                {MOCK_REVIEW_DATA.improvedTranscript}
              </p>
              
              <button
                onClick={handlePlayImprovedAudio}
                disabled={isLoading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-sm transition-all ${
                  hasPlayedAudio ? "bg-indigo-600 text-white hover:bg-indigo-700" : "animate-pulse bg-indigo-500 text-white hover:bg-indigo-600"
                }`}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                {isPlaying ? "Playing AI Voice..." : hasPlayedAudio ? "Listen Again" : "Play Native Audio"}
              </button>
            </div>
          </div>
        </section>

        {/* STEP 2: Grammar & Phrasing (Fades in) */}
        <section className={`space-y-4 transition-opacity duration-500 ${hasPlayedAudio ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">2</span>
            <h3 className="text-lg font-bold text-gray-800">Grammar & Phrasing</h3>
          </div>

          <div className="grid gap-4">
            {MOCK_REVIEW_DATA.grammarSuggestions.map((item) => {
              const isActioned = actionedCards.has(item.id);
              return (
                <div key={item.id} className={`flex flex-col gap-4 rounded-2xl border p-5 shadow-sm transition-all md:flex-row md:items-center md:justify-between ${isActioned ? "border-emerald-200 bg-emerald-50/30" : "border-gray-200 bg-white"}`}>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-4">
                       <div className="flex-1">
                          <p className="text-sm font-medium text-red-500 line-through">{item.original}</p>
                          <p className="mt-1 text-lg font-semibold text-emerald-700">{item.improved}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-2 rounded-lg bg-gray-50 p-3">
                       <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                       <p className="text-sm text-gray-600">{item.explanation}</p>
                    </div>
                  </div>
                  <div className="shrink-0 md:pl-6">
                    <button onClick={() => handleCardAcknowledge(item.id)} className={`flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all md:w-auto ${isActioned ? "bg-emerald-100 text-emerald-700 cursor-default" : "bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 hover:-translate-y-0.5"}`}>
                      {isActioned ? <><CheckCircle2 className="h-5 w-5" /> Got it!</> : "Acknowledge"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STEP 3: Try It Out (Fades in) */}
        <section className={`space-y-4 transition-opacity duration-500 ${allCardsActioned ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
           <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">3</span>
            <h3 className="text-lg font-bold text-gray-800">Try it out</h3>
          </div>
          
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6 text-center shadow-sm">
             <p className="mb-6 text-sm text-sky-800 font-medium">Read the improved transcript aloud to practice your new phrasing.</p>
             <button onClick={handlePracticeToggle} className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all ${isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-sky-500 hover:bg-sky-600 hover:scale-105"}`}>
                <Mic className="h-8 w-8 text-white" />
             </button>
             <AnimatePresence>
                 {transcript && (
                     <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-xl border border-sky-200 bg-white p-4 text-sky-900">
                         "{transcript}"
                     </motion.div>
                 )}
                 {practiceCompleted && (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm font-bold text-emerald-600 flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-4 w-4" /> Practice Complete!
                     </motion.div>
                 )}
             </AnimatePresence>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 w-full border-t border-gray-200 bg-white p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
                {!hasPlayedAudio ? "Listen to the audio to continue." 
                 : !allCardsActioned ? "Acknowledge all grammar rules to continue." 
                 : !practiceCompleted ? "Try recording the new phrase to continue."
                 : "Ready to save!"}
            </p>
            <button onClick={onComplete} disabled={!isReviewComplete} className={`flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-bold shadow-sm transition-all ${isReviewComplete ? "bg-gray-900 text-white hover:bg-black hover:scale-105" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
              Save Review <ArrowRight className="h-5 w-5" />
            </button>
        </div>
      </div>
    </div>
  );
}