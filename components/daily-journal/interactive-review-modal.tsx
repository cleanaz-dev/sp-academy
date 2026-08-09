// app/journal/interactive-review-modal.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useSpeech } from "@/context/speech-context";
import { useSpeak } from "@/hooks/use-speak"; // Updated hook
import {
  X, Volume2, CheckCircle2, AlertCircle, Mic, ArrowRight, Sparkles, Loader2, Quote, Activity, Turtle, Rabbit
} from "lucide-react";

interface InteractiveReviewModalProps {
  onClose: () => void;
  onComplete: () => void;
  journal: any; 
}

export default function InteractiveReviewModal({ onClose, onComplete, journal }: InteractiveReviewModalProps) {
  const { startRecording, stopRecording, isRecording, transcript } = useSpeech();
  const { speak, stop, isPlaying, isLoading } = useSpeak();
  
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [actionedCards, setActionedCards] = useState<Set<string>>(new Set());
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  
  // NEW: State for the prosody speed
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.8);

  const review = journal?.review || {};
  const originalTranscript = journal?.transcript || "No transcript available.";
  const improvedTranscript = review?.finalTranscript || originalTranscript;
  const translation = review?.translation;
  
  const targetLanguage = journal?.language?.split("-")[0] || "en";
  const summaryFeedback = review?.summaryFeedback;
  
  const overallScore = review?.overallScore || 0;
  const accuracyScore = review?.accuracyScore || 0;
  const fluencyScore = review?.fluencyScore || 0;

  const grammarSuggestions = useMemo(() => {
    if (!review?.grammarMistakes) return [];
    let parsed = review.grammarMistakes;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) { parsed = []; }
    }
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: any, index: number) => ({
      id: item.id || `grammar-${index}`,
      original: item.original || "Original text",
      improved: item.improved || "Improved text",
      explanation: item.explanation || "No explanation provided.",
    }));
  }, [review?.grammarMistakes]);

  const mispronouncedWords = useMemo(() => {
    if (!review?.wordAnalysis) return [];
    let parsed = review.wordAnalysis;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) { parsed = []; }
    }
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((w: any) => w.errorType && w.errorType !== "None");
  }, [review?.wordAnalysis]);

  const allCardsActioned = grammarSuggestions.length === 0 || actionedCards.size === grammarSuggestions.length;
  const isReviewComplete = hasPlayedAudio && allCardsActioned && practiceCompleted;

  // Handlers
  const handlePlayImprovedAudio = async () => {
    setHasPlayedAudio(true);
    // Pass the playbackSpeed down into the hook
    await speak(improvedTranscript, targetLanguage, playbackSpeed);
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
      // Reset completion if they decide to record again
      setPracticeCompleted(false);
      await startRecording(targetLanguage);
    }
  };

  useEffect(() => {
    return () => stop();
  }, [stop]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  // Logic for the bottom bar dynamic status text
  const getStatusText = () => {
    if (!hasPlayedAudio) return "1. Listen to the audio to continue";
    if (!allCardsActioned) return "2. Acknowledge all grammar rules";
    if (isRecording) return "Recording... Tap mic to stop";
    if (!practiceCompleted) return "3. Tap mic to practice speaking";
    return "Ready to save!";
  };

  const canRecord = hasPlayedAudio && allCardsActioned;

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
              Analyze your pronunciation and grammar.
            </p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <X className="h-6 w-6" />
        </button>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 p-6 pb-32">
        
        {/* --- SUMMARY & METRICS CARD --- */}
        <div className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              AI Feedback
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {summaryFeedback || "You did a great job! Review the suggestions below to sound more like a native speaker."}
            </p>
          </div>
          
          <div className="flex gap-3 shrink-0">
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getScoreColor(overallScore)} min-w-[80px]`}>
              <span className="text-2xl font-black">{overallScore}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Overall</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getScoreColor(accuracyScore)} min-w-[80px] hidden sm:flex`}>
              <span className="text-2xl font-black">{accuracyScore}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Accuracy</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getScoreColor(fluencyScore)} min-w-[80px] hidden sm:flex`}>
              <span className="text-2xl font-black">{fluencyScore}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Fluency</span>
            </div>
          </div>
        </div>

        {/* --- STEP 1: Listen & Compare --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
            <h3 className="text-lg font-bold text-gray-800">Listen & Compare</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col">
              <span className="mb-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-500 w-max">What you said</span>
              <p className="text-lg text-gray-600 line-through decoration-red-400/50 decoration-2 mb-4">
                {originalTranscript}
              </p>
              
              {mispronouncedWords.length > 0 && (
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <span className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 block">Pronunciation Errors</span>
                  <div className="flex flex-wrap gap-2">
                    {mispronouncedWords.map((w: any, i: number) => (
                      <span key={i} className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-100 shadow-sm flex items-center gap-1">
                        {w.word} <span className="opacity-50 text-[10px]">({w.errorType})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative flex flex-col justify-between rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-5 shadow-sm">
              <div>
                <span className="mb-2 inline-block rounded bg-indigo-200 px-2 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">How a native says it</span>
                <p className="text-xl font-medium text-indigo-950 mb-2">
                  {improvedTranscript}
                </p>
                {translation && (
                  <p className="text-sm text-indigo-700/70 italic flex items-start gap-1 mb-6">
                    <Quote className="w-3 h-3 mt-1 shrink-0" /> {translation}
                  </p>
                )}
              </div>
              
              <div className="mt-auto pt-4 space-y-4">
                {/* NEW: Speed Slider Control */}
                <div className="flex items-center gap-3 rounded-xl bg-white/60 p-2 text-sm border border-indigo-100/50 shadow-inner">
                  <Turtle className="h-5 w-5 text-indigo-400 shrink-0" />
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="flex-1 h-1.5 appearance-none rounded-lg bg-indigo-200 accent-indigo-600 cursor-pointer"
                  />
                  <Rabbit className="h-5 w-5 text-indigo-400 shrink-0" />
                  <span className="w-8 text-right font-bold text-indigo-900 text-xs">{playbackSpeed.toFixed(1)}x</span>
                </div>

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
          </div>
        </section>

        {/* --- STEP 2: Grammar & Phrasing --- */}
        {grammarSuggestions.length > 0 && (
          <section className={`space-y-4 transition-opacity duration-500 ${hasPlayedAudio ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">2</span>
              <h3 className="text-lg font-bold text-gray-800">Grammar & Phrasing</h3>
            </div>

            <div className="grid gap-4">
              {grammarSuggestions.map((item: any) => {
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
        )}

        {/* --- STEP 3: Try It Out (Live Transcript Area) --- */}
        <section className={`space-y-4 transition-opacity duration-500 ${canRecord ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
           <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
              {grammarSuggestions.length > 0 ? "3" : "2"}
            </span>
            <h3 className="text-lg font-bold text-gray-800">Try it out</h3>
          </div>
          
          <div className="rounded-2xl border border-sky-100 bg-sky-50 p-6 text-center shadow-sm flex flex-col items-center justify-center min-h-[180px]">
             <p className="mb-4 text-sm text-sky-800 font-medium">
               {isRecording ? "Listening to you... Tap the mic below to stop." 
                : practiceCompleted ? "Great job! You can finalize your review now." 
                : "Read the improved transcript aloud using the mic button below to practice."}
             </p>
             <AnimatePresence>
                 {transcript && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }} 
                       animate={{ opacity: 1, y: 0 }} 
                       exit={{ opacity: 0 }}
                       className="mt-2 w-full max-w-lg rounded-xl border border-sky-200 bg-white p-4 text-sky-900 italic"
                     >
                         "{transcript}"
                     </motion.div>
                 )}
             </AnimatePresence>
          </div>
        </section>
      </main>

      {/* --- STICKY BOTTOM ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 w-full border-t border-gray-200 bg-white p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          
          {/* Left Side: Mic & Status */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button 
              onClick={handlePracticeToggle} 
              disabled={!canRecord}
              className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full shadow-sm transition-all ${
                isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse text-white"
                : practiceCompleted ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                : !canRecord ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-sky-500 hover:bg-sky-600 hover:scale-105 text-white"
              }`}
            >
              {practiceCompleted && !isRecording ? <CheckCircle2 className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              {isRecording && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                </span>
              )}
            </button>
            
            <p className="text-sm font-medium text-gray-500 truncate">
              {getStatusText()}
            </p>
          </div>

          {/* Right Side: Finish Button */}
          <button 
            onClick={onComplete} 
            disabled={!isReviewComplete} 
            className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition-all ${
              isReviewComplete ? "bg-gray-900 text-white hover:bg-black hover:scale-105" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Finish <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

