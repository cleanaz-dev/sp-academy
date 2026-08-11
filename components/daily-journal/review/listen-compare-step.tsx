"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useSpeak } from "@/hooks/use-speak";
import { Pause, Play, Quote, Turtle, Rabbit, Loader2, Volume2 } from "lucide-react";
import ReviewSummary from "./review-summary"

interface ListenCompareStepProps {
  originalTranscript: string;
  improvedTranscript: string;
  translation?: string;
  mispronouncedWords: any[];
  targetLanguage: string;
  originalAudioUrl?: string;
  hasPlayedAudio: boolean;
  setHasPlayedAudio: (val: boolean) => void;
  summaryData: any;
}

export default function ListenCompareStep({
  originalTranscript, improvedTranscript, translation, mispronouncedWords, targetLanguage,
  originalAudioUrl, hasPlayedAudio, setHasPlayedAudio, summaryData
}: ListenCompareStepProps) {
  const { speak, stop, isPlaying, isLoading } = useSpeak();
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.8);
  const [isOriginalPlaying, setIsOriginalPlaying] = useState(false);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      stop();
      if (originalAudioRef.current) originalAudioRef.current.pause();
    };
  }, [stop]);

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

  const handlePlayImprovedAudio = async () => {
    if (isOriginalPlaying) {
      originalAudioRef.current?.pause();
      setIsOriginalPlaying(false);
    }
    setHasPlayedAudio(true);
    await speak(improvedTranscript, targetLanguage, playbackSpeed);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-5xl mx-auto w-full">
      <ReviewSummary {...summaryData} />

      {originalAudioUrl && (
        <audio ref={originalAudioRef} src={originalAudioUrl} onEnded={() => setIsOriginalPlaying(false)} className="hidden" />
      )}

      <div className="grid gap-4 md:grid-cols-2 md:gap-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col">
          <div>
            <span className="mb-3 inline-block rounded bg-gray-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-gray-500 w-max">What you said</span>
            <p className="text-lg text-gray-600 line-through decoration-red-400/50 decoration-2 mb-6">
              {originalTranscript}
            </p>
          </div>
          
          <div className="mt-auto pt-6 space-y-5 border-t border-gray-100">
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
              <button onClick={toggleOriginalAudio} className="flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold shadow-sm transition-all bg-gray-100 text-gray-700 hover:bg-gray-200">
                {isOriginalPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                {isOriginalPlaying ? "Playing..." : "Play My Audio"}
              </button>
            )}
          </div>
        </div>

        <div className="relative flex flex-col justify-between rounded-2xl border-2 border-indigo-100 bg-indigo-50 p-6 shadow-sm">
          <div>
            <span className="mb-3 inline-block rounded bg-indigo-200 px-2 py-1 text-xs font-bold uppercase tracking-wider text-indigo-700">How a native says it</span>
            <p className="text-2xl font-medium text-indigo-950 mb-3 leading-tight">{improvedTranscript}</p>
            {translation && (
              <p className="text-sm text-indigo-700/70 italic flex items-start gap-1 mb-6">
                <Quote className="w-3 h-3 mt-1 shrink-0" /> {translation}
              </p>
            )}
          </div>
          
          <div className="mt-auto pt-6 space-y-5">
            <div className="flex items-center gap-3 rounded-xl bg-white/60 p-3 text-sm border border-indigo-100/50 shadow-inner">
              <Turtle className="h-5 w-5 text-indigo-400 shrink-0" />
              <input type="range" min="0.5" max="1.5" step="0.1" value={playbackSpeed} onChange={(e) => setPlaybackSpeed(Number(e.target.value))} className="flex-1 h-2 appearance-none rounded-lg bg-indigo-200 accent-indigo-600 cursor-pointer" />
              <Rabbit className="h-5 w-5 text-indigo-400 shrink-0" />
              <span className="w-8 text-right font-bold text-indigo-900 text-sm">{playbackSpeed.toFixed(1)}x</span>
            </div>

            <button onClick={handlePlayImprovedAudio} disabled={isLoading} className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold shadow-sm transition-all ${hasPlayedAudio ? "bg-indigo-600 text-white hover:bg-indigo-700" : "animate-pulse bg-indigo-500 text-white hover:bg-indigo-600"}`}>
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Volume2 className="h-6 w-6" />}
              {isPlaying ? "Playing AI Voice..." : hasPlayedAudio ? "Listen Again" : "Play Native Audio"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}