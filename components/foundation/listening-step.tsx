"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Square, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { useS3Media } from "@/context/s3-context";
import { ScrollArea } from "@/components/ui/scroll-area"; // <-- Shadcn ScrollArea

export function ListeningStep({ data, onNext }: { data: any; onNext: () => void }) {
  // Resolve S3 Keys via our context
  const { urls, isLoading: isAudioLoading } = useS3Media([data.audioS3Key]);
  const resolvedAudioUrl = urls[0];

  // Audio state & ref
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State for sentence building
  const [availableWords, setAvailableWords] = useState<string[]>(data.wordBank || []);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");

  // Cleanup audio if component unmounts
  useEffect(() => {
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
  };

  const toggleAudio = () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    if (!resolvedAudioUrl) return; 

    const audio = new Audio(resolvedAudioUrl);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    
    audio.play().catch(err => {
      console.warn("Audio playback skipped:", err);
      setIsPlaying(false);
    });
    
    setIsPlaying(true);
  };

  // Move word from Bank to Sentence
  const handleAddWord = (word: string, idx: number) => {
    setStatus("idle");
    setSelectedWords([...selectedWords, word]);
    const newAvailable = [...availableWords];
    newAvailable.splice(idx, 1);
    setAvailableWords(newAvailable);
  };

  // Move word from Sentence back to Bank
  const handleRemoveWord = (word: string, idx: number) => {
    setStatus("idle");
    const newSelected = [...selectedWords];
    newSelected.splice(idx, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  };

  // Reset the whole board
  const handleReset = () => {
    setStatus("idle");
    setSelectedWords([]);
    setAvailableWords(data.wordBank || []);
  };

  // Check if they built the right sentence
  const handleCheck = () => {
    const expected = data.expectedOrder || [];
    const isCorrectLength = selectedWords.length === expected.length;
    const isPerfectMatch = isCorrectLength && selectedWords.every((word, i) => word === expected[i]);

    if (isPerfectMatch) {
      setStatus("correct");
      setFeedbackMsg("✅ Excellent ear! You nailed it.");
    } else {
      setStatus("incorrect");
      setFeedbackMsg("❌ Not quite right. Review your word order and try again.");
    }
  };

  const handleNext = () => {
    stopAudio();
    onNext();
  };

  return (
    <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 overflow-y-auto">
      
      <div className="mb-8 text-center shrink-0">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-3">
          Listen & Build
        </h2>
        <p className="text-gray-500 text-lg">
          Tap the words to recreate what you hear.
        </p>
      </div>
      
      {/* Big Audio Play Button */}
      <div className="flex justify-center mb-10 shrink-0">
        <button 
          onClick={toggleAudio}
          disabled={isAudioLoading}
          className={`group relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isAudioLoading 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : isPlaying 
                ? 'bg-blue-100 text-blue-600 ring-8 ring-blue-50' 
                : 'bg-gray-900 text-white hover:bg-black hover:scale-105'
          }`}
        >
          {isAudioLoading ? (
            <Loader2 size={32} className="animate-spin" />
          ) : isPlaying ? (
            <Square size={28} className="fill-current" />
          ) : (
            <Play size={32} className="fill-current ml-1" />
          )}
          {isPlaying && (
            <span className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20"></span>
          )}
        </button>
      </div>
      
      {/* Sentence Builder Drop Zone */}
      <div className="mb-6 shrink-0">
        <div className={`min-h-[80px] w-full p-4 rounded-2xl border-2 border-dashed flex flex-wrap gap-2 items-center transition-colors ${
          status === "correct" ? "border-green-400 bg-green-50" : 
          status === "incorrect" ? "border-red-400 bg-red-50" : 
          "border-gray-300 bg-gray-50"
        }`}>
          {selectedWords.length === 0 && (
            <span className="text-gray-400 font-medium w-full text-center">
              Tap words below to build the sentence...
            </span>
          )}
          
          {selectedWords.map((word, idx) => {
            const expected = data.expectedOrder || [];
            const isCorrectPosition = word === expected[idx];
            
            // Default word styling
            let wordStyle = "bg-white border-gray-200 text-gray-800 hover:bg-red-50 hover:border-red-200";
            
            if (status === "correct") {
              // Everything is perfect
              wordStyle = "bg-green-500 border-green-600 text-white hover:bg-green-600";
            } else if (status === "incorrect") {
              // Post-check feedback (Red vs Green)
              wordStyle = isCorrectPosition 
                ? "bg-green-100 border-green-500 text-green-900 hover:bg-red-50 hover:border-red-300"
                : "bg-red-100 border-red-400 text-red-900 hover:bg-red-200";
            } else {
              // Real-time hint as they build!
              if (isCorrectPosition) {
                wordStyle = "bg-green-50 border-green-300 text-green-800 hover:bg-red-50 hover:border-red-200";
              }
            }

            return (
              <button
                key={`selected-${idx}`}
                onClick={() => handleRemoveWord(word, idx)}
                className={`px-4 py-2 border-2 rounded-xl shadow-xs font-bold transition-all active:scale-95 text-lg ${wordStyle}`}
                title="Tap to remove"
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {/* SHADCN WORD BANK SCROLL AREA */}
      <div className="mb-10 w-full shrink-0">
        <ScrollArea className="max-h-[125px] w-full rounded-2xl border border-gray-100 bg-gray-50/50">
          <div className="flex flex-wrap justify-center gap-3 p-4">
            {availableWords.map((word, idx) => (
              <button
                key={`bank-${idx}`}
                onClick={() => handleAddWord(word, idx)}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 shadow-xs transition-all active:scale-95 text-lg"
              >
                {word}
              </button>
            ))}
            {availableWords.length === 0 && (
              <span className="text-gray-400 text-sm font-medium py-2">
                All words used!
              </span>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Feedback & Action Area */}
      <div className="mt-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 shrink-0">
        
        {/* Feedback Message */}
        <div className="flex-1 flex flex-col justify-center gap-1 w-full">
          {status !== "idle" && (
            <div className={`font-bold animate-in fade-in text-sm md:text-base flex items-center justify-between ${
              status === "correct" ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{feedbackMsg}</span>
              
              {/* Reset Button */}
              {selectedWords.length > 0 && status !== "correct" && (
                <button 
                  onClick={handleReset}
                  className="ml-3 p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  title="Reset Sentence"
                >
                  <RotateCcw size={20} />
                </button>
              )}
            </div>
          )}
          
          {/* Freeform contrast hint if they get it wrong */}
          {status === "incorrect" && data.contrast && (
            <p className="text-sm font-medium text-red-400/80 animate-in fade-in mt-1">
              Hint — pay attention to: {data.contrast}
            </p>
          )}
        </div>

        {/* Action Button (Check or Next) */}
        {status === "correct" ? (
          <button 
            onClick={handleNext} 
            className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-lg shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            Next: Knowledge Check <ArrowRight size={20} />
          </button>
        ) : (
          <button 
            onClick={handleCheck}
            disabled={selectedWords.length === 0}
            className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl text-lg transition-all flex items-center justify-center ${
              selectedWords.length > 0
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md active:scale-95' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Check Answer
          </button>
        )}
      </div>

    </div>
  );
}