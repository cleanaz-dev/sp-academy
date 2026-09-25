"use client";

import { useMiniAudioPlayer } from "@/hooks/use-mini-audio-player";
import React, { useState } from "react";
import { Play, Square, CheckCircle2, XCircle, ArrowRight, RotateCcw } from "lucide-react";

export function ListeningStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { play, isPlaying, currentS3Key } = useMiniAudioPlayer();
  const isThisAudioPlaying = isPlaying && currentS3Key === data.audioS3Key;

  // State for sentence building
  const [availableWords, setAvailableWords] = useState<string[]>(data.wordBank);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [feedbackMsg, setFeedbackMsg] = useState<string>("");

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
    setAvailableWords(data.wordBank);
  };

  // Check if they built the right sentence
  const handleCheck = () => {
    const isCorrectLength = selectedWords.length === data.expectedWords.length;
    const isPerfectMatch = isCorrectLength && selectedWords.every((word, i) => word === data.expectedWords[i]);

    if (isPerfectMatch) {
      setStatus("correct");
      setFeedbackMsg("✅ Excellent ear! You nailed it.");
    } else {
      setStatus("incorrect");
      
      // Target specific contrast distractors!
      if (data.contrastFeedback && selectedWords.includes(data.contrastFeedback.triggerWord)) {
        setFeedbackMsg(`❌ ${data.contrastFeedback.message}`);
      } else {
        setFeedbackMsg("❌ Not quite right. Listen to the audio again and check your word order.");
      }
    }
  };

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
      
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Listen & Build
        </h2>
        <p className="text-gray-500 text-lg">
          Tap the words to recreate what you hear.
        </p>
      </div>
      
      {/* Big Audio Play Button */}
      <div className="flex justify-center mb-10">
        <button 
          onClick={() => play(data.audioS3Key)}
          className={`group relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center shadow-lg transition-all ${
            isThisAudioPlaying 
              ? 'bg-blue-100 text-blue-600 ring-8 ring-blue-50' 
              : 'bg-gray-900 text-white hover:bg-black hover:scale-105'
          }`}
        >
          {isThisAudioPlaying ? <Square size={28} className="fill-current" /> : <Play size={32} className="fill-current ml-1" />}
          {isThisAudioPlaying && (
            <span className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-20"></span>
          )}
        </button>
      </div>
      
      {/* Sentence Builder Drop Zone */}
      <div className="mb-6">
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
          {selectedWords.map((word, idx) => (
            <button
              key={`selected-${idx}`}
              onClick={() => handleRemoveWord(word, idx)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-xs font-bold text-gray-800 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 text-lg"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Word Bank */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {availableWords.map((word, idx) => (
          <button
            key={`bank-${idx}`}
            onClick={() => handleAddWord(word, idx)}
            className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 shadow-xs transition-all active:scale-95 text-lg"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Feedback & Action Area */}
      <div className="mt-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100">
        
        {/* Feedback Message */}
        <div className="flex-1 flex items-center gap-3 w-full">
          {status !== "idle" && (
            <div className={`font-bold animate-in fade-in text-sm md:text-base ${
              status === "correct" ? 'text-green-600' : 'text-red-500'
            }`}>
              {feedbackMsg}
            </div>
          )}
          
          {/* Reset Button (Only show if words are selected and not correct) */}
          {selectedWords.length > 0 && status !== "correct" && (
            <button 
              onClick={handleReset}
              className="ml-auto p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset Sentence"
            >
              <RotateCcw size={20} />
            </button>
          )}
        </div>

        {/* Action Button (Check or Next) */}
        {status === "correct" ? (
          <button 
            onClick={onNext} 
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