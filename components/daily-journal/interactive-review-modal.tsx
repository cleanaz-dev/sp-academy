"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
// 1. Swapped useSpeech with your new usePronunciation context
import { usePronunciation } from "@/context/pronunciation-context"; // <-- Adjust path if needed
import { useSpeak } from "@/hooks/use-speak";
import {
  X, Volume2, CheckCircle2, AlertCircle, Mic, ArrowRight, Sparkles, Loader2, Quote, Activity, Turtle, Rabbit, Play, Pause
} from "lucide-react";

interface InteractiveReviewModalProps {
  onClose: () => void;
  onComplete: () => void;
  journal: any; 
}

export default function InteractiveReviewModal({ onClose, onComplete, journal }: InteractiveReviewModalProps) {
  // 2. Using your new Pronunciation Hook for the mic
  const { isRecording, score, error, assessSpeech, cancelAssessment, reset } = usePronunciation();
  
  // 3. Your existing TTS hook (completely untouched)
  const { speak, stop, isPlaying, isLoading } = useSpeak();
  
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [actionedCards, setActionedCards] = useState<Set<string>>(new Set());
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  
  // Audio configuration states
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.8);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isOriginalPlaying, setIsOriginalPlaying] = useState(false);

  const review = journal?.review || {};
  const originalTranscript = journal?.transcript || "No transcript available.";
  const improvedTranscript = review?.finalTranscript || originalTranscript;
  const translation = review?.translation;
  
  // Azure usually expects a full locale like "en-US" or "es-ES"
  const targetLanguage = journal?.language || "en-US";
  const summaryFeedback = review?.summaryFeedback;
  
  const overallScore = review?.overallScore || 0;
  const accuracyScore = review?.accuracyScore || 0;
  const fluencyScore = review?.fluencyScore || 0;

  const originalAudioUrl = journal?.audioUrl || (journal?.s3Key ? `/api/audio?key=${journal.s3Key}` : undefined);

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
  const canRecord = hasPlayedAudio && allCardsActioned;
  const isReviewComplete = hasPlayedAudio && allCardsActioned && practiceCompleted;
  
  const timeToRecord = canRecord && !practiceCompleted && !isRecording;

  // Audio Handlers
  const toggleOriginalAudio = () => {
    if (isPlaying) stop(); 
    if (isOriginalPlaying) {
      originalAudioRef.current?.pause();
      setIsOriginalPlaying(false);
    } else {
      originalAudioRef.current?.play();
      setIsOriginalPlaying(true);
    }
  };

  const handleOriginalAudioEnded = () => setIsOriginalPlaying(false);

  const handlePlayImprovedAudio = async () => {
    if (isOriginalPlaying) {
      originalAudioRef.current?.pause();
      setIsOriginalPlaying(false);
    }
    setHasPlayedAudio(true);
    await speak(improvedTranscript, targetLanguage, playbackSpeed);
  };

  const handleCardAcknowledge = (id: string) => {
    setActionedCards((prev) => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });
  };

  // 4. Integrated your new Azure Pronunciation Logic here
  const handlePracticeToggle = async () => {
    if (isRecording) {
      cancelAssessment();
    } else {
      reset();
      setPracticeCompleted(false);
      // Evaluates the user reading the *improved* transcript
      await assessSpeech(improvedTranscript, targetLanguage);
    }
  };

  // Watch for successful scores to mark practice as complete
  useEffect(() => {
    if (score && !error) {
      setPracticeCompleted(true);
    }
  }, [score, error]);

  // Cleanup
  useEffect(() => {
    return () => {
      stop();
      if (originalAudioRef.current) {
        originalAudioRef.current.pause();
      }
      cancelAssessment();
    };
  }, [stop, cancelAssessment]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 70) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getStatusText = () => {
    if (!hasPlayedAudio) return "1. Listen to the AI audio to continue";
    if (!allCardsActioned) return "2. Acknowledge all grammar rules";
    if (timeToRecord) return "3. Tap the mic icon to practice!";
    if (isRecording) return "Evaluating... Read the text aloud.";
    if (error) return "Error during assessment. Try again.";
    if (score) return "Evaluation complete! Review your score.";
    return "Ready to save!";
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 overflow-y-auto">
      {originalAudioUrl && (
        <audio ref={originalAudioRef} src={originalAudioUrl} onEnded={handleOriginalAudioEnded} className="hidden" />
      )}

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 md:px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-800 truncate">Journal Review</h2>
            <p className="text-xs font-medium text-gray-500 truncate">Analyze your pronunciation and grammar.</p>
          </div>
        </div>
        <button onClick={onClose} className="shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
          <X className="h-6 w-6" />
        </button>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 p-4 md:p-6 pb-36">
        
        {/* --- SUMMARY & METRICS CARD --- */}
        <div className="rounded-2xl border border-indigo-100 bg-white p-4 md:p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1 space-y-3">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              AI Feedback
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {summaryFeedback || "You did a great job! Review the suggestions below to sound more like a native speaker."}
            </p>
          </div>
          
          <div className="flex gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getScoreColor(overallScore)} min-w-[80px] flex-1 sm:flex-none`}>
              <span className="text-2xl font-black">{overallScore}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Overall</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getScoreColor(accuracyScore)} min-w-[80px] flex-1 sm:flex-none`}>
              <span className="text-2xl font-black">{accuracyScore}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Accuracy</span>
            </div>
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${getScoreColor(fluencyScore)} min-w-[80px] flex-1 sm:flex-none`}>
              <span className="text-2xl font-black">{fluencyScore}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Fluency</span>
            </div>
          </div>
        </div>

        {/* --- STEP 1: Listen & Compare --- */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">1</span>
            <h3 className="text-lg font-bold text-gray-800">Listen & Compare</h3>
          </div>

          <div className="grid gap-4 md:grid-cols-2 md:gap-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col">
              <div>
                <span className="mb-2 inline-block rounded bg-gray-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-500 w-max">What you said</span>
                <p className="text-lg text-gray-600 line-through decoration-red-400/50 decoration-2 mb-4">
                  {originalTranscript}
                </p>
              </div>
              
              <div className="mt-auto pt-4 space-y-4 border-t border-gray-100">
                {mispronouncedWords.length > 0 && (
                  <div>
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

                {originalAudioUrl && (
                  <button onClick={toggleOriginalAudio} className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-sm transition-all bg-gray-100 text-gray-700 hover:bg-gray-200">
                    {isOriginalPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    {isOriginalPlaying ? "Playing..." : "Play My Audio"}
                  </button>
                )}
              </div>
            </div>

            <div className="relative flex flex-col justify-between rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-5 shadow-sm">
              <div>
                <span className="mb-2 inline-block rounded bg-indigo-200 px-2 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">How a native says it</span>
                <p className="text-xl font-medium text-indigo-950 mb-2">{improvedTranscript}</p>
                {translation && (
                  <p className="text-sm text-indigo-700/70 italic flex items-start gap-1 mb-6">
                    <Quote className="w-3 h-3 mt-1 shrink-0" /> {translation}
                  </p>
                )}
              </div>
              
              <div className="mt-auto pt-4 space-y-4">
                <div className="flex items-center gap-3 rounded-xl bg-white/60 p-2 text-sm border border-indigo-100/50 shadow-inner">
                  <Turtle className="h-5 w-5 text-indigo-400 shrink-0" />
                  <input type="range" min="0.5" max="1.5" step="0.1" value={playbackSpeed} onChange={(e) => setPlaybackSpeed(Number(e.target.value))} className="flex-1 h-1.5 appearance-none rounded-lg bg-indigo-200 accent-indigo-600 cursor-pointer" />
                  <Rabbit className="h-5 w-5 text-indigo-400 shrink-0" />
                  <span className="w-8 text-right font-bold text-indigo-900 text-xs">{playbackSpeed.toFixed(1)}x</span>
                </div>

                <button onClick={handlePlayImprovedAudio} disabled={isLoading} className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold shadow-sm transition-all ${hasPlayedAudio ? "bg-indigo-600 text-white hover:bg-indigo-700" : "animate-pulse bg-indigo-500 text-white hover:bg-indigo-600"}`}>
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
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">2</span>
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

        {/* --- STEP 3: Try It Out (Now fully hooked to your Pronunciation Context) --- */}
        <section className={`space-y-4 transition-opacity duration-500 ${canRecord ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
           <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
              {grammarSuggestions.length > 0 ? "3" : "2"}
            </span>
            <h3 className="text-lg font-bold text-gray-800">Try it out</h3>
          </div>
          
          <div className={`rounded-2xl border p-6 text-center shadow-sm flex flex-col items-center justify-center min-h-[180px] transition-all duration-500 ${
            timeToRecord ? "border-sky-300 bg-sky-100/50 shadow-[0_0_20px_rgba(56,189,248,0.15)]" : "border-sky-100 bg-sky-50"
          }`}>
             <p className={`mb-4 text-sm font-medium transition-colors ${timeToRecord ? "text-sky-900" : "text-sky-800"}`}>
               {isRecording ? "Listening to you... Read the improved text aloud." 
                : practiceCompleted ? "Great job! Here is how you sounded." 
                : "Read the improved transcript aloud using the mic button below to practice."}
             </p>
             
             {error && (
               <div className="mt-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
                 {error}
               </div>
             )}

             {/* This dynamically renders your Azure scores in real time once complete! */}
             <AnimatePresence>
                 {score && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10 }} 
                       animate={{ opacity: 1, y: 0 }} 
                       exit={{ opacity: 0 }}
                       className="mt-2 w-full max-w-2xl flex flex-col items-center"
                     >
                        <div className="flex gap-4 mb-4">
                          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-sky-100 min-w-[80px]">
                            <span className="text-2xl font-black text-sky-600">{score.pronunciationScore}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Pronunciation</span>
                          </div>
                          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-sky-100 min-w-[80px]">
                            <span className="text-2xl font-black text-sky-600">{score.accuracyScore}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Accuracy</span>
                          </div>
                          <div className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-sky-100 min-w-[80px]">
                            <span className="text-2xl font-black text-sky-600">{score.fluencyScore}</span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Fluency</span>
                          </div>
                        </div>

                        {/* Visual breakdown of words colored by accuracy */}
                        <div className="rounded-xl border border-sky-200 bg-white p-5 text-lg flex flex-wrap justify-center gap-x-1.5 shadow-sm leading-relaxed">
                          {score.words.map((w, i) => (
                            <span 
                              key={i} 
                              className={`
                                font-medium transition-colors
                                ${w.accuracyScore >= 80 ? "text-emerald-600" : 
                                  w.accuracyScore >= 60 ? "text-yellow-500" : "text-red-500 underline underline-offset-4 decoration-red-300"}
                              `}
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
        </section>
      </main>

      {/* --- STICKY BOTTOM ACTION BAR --- */}
      <div className="fixed bottom-0 left-0 w-full border-t border-gray-200 bg-white p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 relative">
          
          <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
            <div className="relative flex shrink-0 items-center justify-center">
              
              {timeToRecord && (
                <span className="absolute inline-flex h-[130%] w-[130%] animate-ping rounded-full bg-sky-400 opacity-60 duration-1000"></span>
              )}
              
              <AnimatePresence>
                {timeToRecord && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: 10, x: "-50%" }}
                    className="absolute -top-16 left-1/2 whitespace-nowrap rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white shadow-xl animate-bounce z-[100]"
                  >
                    Tap to practice!
                    <div className="absolute -bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-sky-600"></div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={handlePracticeToggle} 
                disabled={!canRecord}
                className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-sm transition-all duration-300 ${
                  isRecording ? "bg-red-500 text-white animate-[pulse_1.5s_ease-in-out_infinite] ring-4 ring-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  : practiceCompleted ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                  : !canRecord ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : timeToRecord ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] hover:bg-sky-600 hover:scale-105"
                  : "bg-sky-500 hover:bg-sky-600 hover:scale-105 text-white"
                }`}
              >
                {practiceCompleted && !isRecording ? <CheckCircle2 className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </button>
            </div>
            
            <p className="text-sm font-medium text-gray-500 truncate">
              {getStatusText()}
            </p>
          </div>

          <button 
            onClick={onComplete} 
            disabled={!isReviewComplete} 
            className={`flex shrink-0 items-center gap-2 rounded-xl px-6 py-4 text-sm font-bold shadow-sm transition-all ${
              isReviewComplete ? "bg-gray-900 text-white hover:bg-black hover:scale-105 shadow-md" 
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