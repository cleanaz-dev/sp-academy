"use client";

import React, { useState } from "react";
import { Mic, ArrowRight, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function QuizStep({ data, onNext }: { data: any; onNext: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [feedback, setFeedback] = useState<string>("");

  const totalQuestions = data.items.length;
  const currentItem = data.items[currentIndex];

  const handleNextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setStatus("idle");
      setFeedback("");
    } else {
      onNext(); // Move to Freestyle AI!
    }
  };

  // --- SUB-RENDERERS FOR QUESTION TYPES ---

  const renderVerbalCloze = (item: any) => {
    // In reality, this mic button would trigger your Deepgram STT hook.
    // For the baseline, we simulate the speech recognition check.
    const simulateSpeechCheck = () => {
      setStatus("correct");
      setFeedback("Excellent pronunciation!");
    };

    return (
      <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
        <h3 className="text-xl text-gray-500 font-medium mb-8">Speak the missing word:</h3>
        
        <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
          <span className="text-blue-500 border-b-4 border-dashed border-blue-200 px-2 pb-1">
            {status === "correct" ? item.acceptableAnswers[0] : "____"}
          </span>
          {item.prompt.replace("___", "")}
        </div>
        
        <p className="text-gray-400 font-medium mb-12 flex items-center gap-2">
          <AlertCircle size={16} /> Hint: {item.hint}
        </p>

        <button 
          onClick={simulateSpeechCheck}
          className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all ${
            status === "correct" 
              ? "bg-green-500 text-white" 
              : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95"
          }`}
        >
          {status === "correct" ? <CheckCircle2 size={40} /> : <Mic size={40} />}
          {status === "idle" && (
            <span className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping opacity-30"></span>
          )}
        </button>
        <p className="mt-4 text-sm font-bold text-gray-400 uppercase tracking-widest">
          {status === "correct" ? "Nailed it" : "Tap to Speak"}
        </p>
      </div>
    );
  };

  const renderTrueFalse = (item: any) => {
    const handleGuess = (guess: boolean) => {
      if (guess === item.isTrue) {
        setStatus("correct");
        setFeedback("✅ Correct! " + item.explanation);
      } else {
        setStatus("incorrect");
        setFeedback("❌ Not quite. " + item.explanation);
      }
    };

    return (
      <div className="flex flex-col w-full max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 mb-8 text-center text-2xl text-gray-800 font-medium leading-relaxed">
          "{item.statement}"
        </div>
        
        <div className="flex gap-4 w-full">
          <button 
            onClick={() => handleGuess(true)}
            disabled={status !== "idle"}
            className="flex-1 py-5 rounded-2xl border-2 border-gray-200 font-bold text-xl text-gray-700 hover:border-green-400 hover:bg-green-50 transition-all active:scale-95 disabled:opacity-50"
          >
            True
          </button>
          <button 
            onClick={() => handleGuess(false)}
            disabled={status !== "idle"}
            className="flex-1 py-5 rounded-2xl border-2 border-gray-200 font-bold text-xl text-gray-700 hover:border-red-400 hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
          >
            False
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full p-8 md:p-12 overflow-y-auto">
      
      {/* Quiz Header & Progress */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Knowledge Check
          </h2>
          <p className="text-gray-500 text-lg">
            Let's see what you remember.
          </p>
        </div>
        {/* Simple Progress Indicator */}
        <div className="flex gap-2">
          {data.items.map((_: any, idx: number) => (
            <div key={idx} className={`h-2.5 w-8 rounded-full transition-colors ${
              idx < currentIndex ? "bg-green-500" : idx === currentIndex ? "bg-blue-500" : "bg-gray-200"
            }`} />
          ))}
        </div>
      </div>

      {/* Dynamic Question Area */}
      <div className="flex-1 flex flex-col justify-center mb-8">
        {currentItem.type === "verbal_cloze" && renderVerbalCloze(currentItem)}
        {currentItem.type === "true_false" && renderTrueFalse(currentItem)}
        {currentItem.type === "reorder" && (
            <div className="text-center text-gray-400 italic">
               {/* Re-use the exact same UI logic from the Listening step here! */}
               [Sentence Builder UI renders here]
            </div>
        )}
      </div>

      {/* Feedback & Next Button Footer */}
      <div className="mt-auto min-h-[80px] flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-6">
        <div className={`flex-1 font-medium text-lg animate-in fade-in ${
          status === "correct" ? "text-green-600" : status === "incorrect" ? "text-red-500" : "text-transparent"
        }`}>
          {feedback || "placeholder"}
        </div>

        <button 
          onClick={handleNextQuestion} 
          disabled={status !== "correct"}
          className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-2 ${
            status === "correct" 
              ? 'bg-gray-900 hover:bg-black text-white shadow-md active:scale-95' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentIndex === totalQuestions - 1 ? "Enter AI Conversation" : "Next Question"} <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
}