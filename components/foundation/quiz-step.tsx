"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, ArrowRight, CheckCircle2, XCircle, AlertCircle, RotateCcw, Square } from "lucide-react";
import { useSpeech } from "@/context/speech-context";
import { useWordAudio } from "@/context/word-audio-context";
import { useMatrix } from "@/context/matrix-context"; // <-- ADDED IMPORT

// --------------------------------------------------------
// 1. VERBAL CLOZE COMPONENT
// --------------------------------------------------------
function VerbalClozeQuestion({ 
  item, 
  targetLang, 
  onResolve 
}: { 
  item: any; 
  targetLang: string; 
  onResolve: (status: "idle" | "correct" | "incorrect", msg: string) => void; 
}) {
  const { startRecording, stopRecording, isRecording, transcript, resetSpeechState } = useSpeech();
  const [localStatus, setLocalStatus] = useState<"idle" | "correct" | "incorrect">("idle");

  // <-- MATRIX TRACKING -->
  const { trackInteraction } = useMatrix();
  const hasTrackedSeen = useRef(false);
  const targetWord = item.acceptableAnswers[0]; // The primary correct answer

  useEffect(() => {
    if (!hasTrackedSeen.current && targetWord) {
      trackInteraction(targetWord, { seen: 1 });
      hasTrackedSeen.current = true;
    }
  }, [targetWord, trackInteraction]);

  // Live evaluation: Check transcript in real-time
  useEffect(() => {
    if (!isRecording || !transcript) return;

    const spokenText = transcript.toLowerCase();
    const isMatch = item.acceptableAnswers.some((ans: string) => spokenText.includes(ans.toLowerCase()));

    if (isMatch) {
      stopRecording();
      setLocalStatus("correct");

      // TRACK SUCCESSFUL SPOKEN ATTEMPT
      trackInteraction(targetWord, { 
        tappedCorrect: 1, 
        spokenAttempt: true, 
        spokenScore: 100 // Perfect score proxy since we used Deepgram!
      });

      onResolve("correct", "✅ Excellent pronunciation!");
    }
  }, [transcript, isRecording, item, stopRecording, onResolve, targetWord, trackInteraction]);

  const handleToggleMic = async () => {
    if (isRecording) {
      await stopRecording();
      setLocalStatus("incorrect");
      
      // TRACK FAILED SPOKEN ATTEMPT
      trackInteraction(targetWord, { 
        tappedWrong: 1, 
        spokenAttempt: true, 
        spokenScore: 0 
      });

      onResolve("incorrect", `❌ You said: "${transcript || "Nothing detected"}". Try again!`);
    } else {
      resetSpeechState();
      setLocalStatus("idle");
      onResolve("idle", "");
      await startRecording(targetLang);
    }
  };

  const promptParts = item.prompt.split("___");

  return (
    <div className="flex flex-col items-center animate-in zoom-in-95 duration-300">
      <h3 className="text-xl text-gray-500 font-medium mb-8">Speak the missing word:</h3>
      
      <div className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight text-center">
        {promptParts[0]}
        <span className="text-blue-500 border-b-4 border-dashed border-blue-200 px-2 pb-1 mx-1">
          {localStatus === "correct" ? item.acceptableAnswers[0] : "____"}
        </span>
        {promptParts[1]}
      </div>
      
      <p className="text-gray-400 font-medium mb-12 flex items-center gap-2">
        <AlertCircle size={16} /> Hint: {item.hint}
      </p>

      <button 
        onClick={handleToggleMic}
        className={`group relative w-28 h-28 rounded-full flex items-center justify-center shadow-xl transition-all ${
          localStatus === "correct" 
            ? "bg-green-500 text-white" 
            : isRecording
            ? "bg-red-500 text-white scale-105 ring-8 ring-red-100"
            : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95"
        }`}
      >
        {localStatus === "correct" ? (
          <CheckCircle2 size={40} />
        ) : isRecording ? (
          <Square size={32} className="fill-current" />
        ) : (
          <Mic size={40} />
        )}
        {isRecording && (
          <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-30"></span>
        )}
      </button>

      {/* Live Transcript Display */}
      <div className="mt-6 min-h-[24px]">
        {isRecording ? (
          <p className="text-sm font-medium text-gray-500 animate-pulse text-center">
            Listening: <span className="italic text-gray-800">"{transcript}..."</span>
          </p>
        ) : (
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest text-center">
            {localStatus === "correct" ? "Nailed it" : "Tap to Speak"}
          </p>
        )}
      </div>
    </div>
  );
}

// --------------------------------------------------------
// 2. TRUE/FALSE COMPONENT
// --------------------------------------------------------
function TrueFalseQuestion({ 
  item, 
  onResolve 
}: { 
  item: any; 
  onResolve: (status: "idle" | "correct" | "incorrect", msg: string) => void; 
}) {
  const [guessed, setGuessed] = useState<boolean | null>(null);
  
  // <-- MATRIX TRACKING -->
  const { trackInteraction } = useMatrix();
  const hasTrackedSeen = useRef(false);
  // Optional: If you assign a targetWord to True/False questions in your schema, it tracks it!
  const targetWord = item.targetWord || item.targetChunk; 

  useEffect(() => {
    if (targetWord && !hasTrackedSeen.current) {
      trackInteraction(targetWord, { seen: 1 });
      hasTrackedSeen.current = true;
    }
  }, [targetWord, trackInteraction]);

  const handleGuess = (guess: boolean) => {
    setGuessed(guess);
    if (guess === item.isTrue) {
      if (targetWord) trackInteraction(targetWord, { tappedCorrect: 1 });
      onResolve("correct", "✅ Correct! " + item.explanation);
    } else {
      if (targetWord) trackInteraction(targetWord, { tappedWrong: 1 });
      onResolve("incorrect", "❌ Not quite. " + item.explanation);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gray-50 p-8 rounded-3xl border border-gray-200 mb-8 text-center text-2xl text-gray-800 font-medium leading-relaxed shadow-inner">
        "{item.statement}"
      </div>
      
      <div className="flex gap-4 w-full">
        <button 
          onClick={() => handleGuess(true)}
          disabled={guessed !== null}
          className={`flex-1 py-5 rounded-2xl border-2 font-bold text-xl transition-all active:scale-95 ${
            guessed === true && item.isTrue ? "bg-green-100 border-green-500 text-green-800" :
            guessed === true && !item.isTrue ? "bg-red-100 border-red-500 text-red-800" :
            "bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50 disabled:opacity-50"
          }`}
        >
          True
        </button>
        <button 
          onClick={() => handleGuess(false)}
          disabled={guessed !== null}
          className={`flex-1 py-5 rounded-2xl border-2 font-bold text-xl transition-all active:scale-95 ${
            guessed === false && !item.isTrue ? "bg-green-100 border-green-500 text-green-800" :
            guessed === false && item.isTrue ? "bg-red-100 border-red-500 text-red-800" :
            "bg-white border-gray-200 text-gray-700 hover:border-red-400 hover:bg-red-50 disabled:opacity-50"
          }`}
        >
          False
        </button>
      </div>
    </div>
  );
}

// --------------------------------------------------------
// 3. REORDER COMPONENT
// --------------------------------------------------------
function ReorderQuestion({ 
  item, 
  onResolve 
}: { 
  item: any; 
  onResolve: (status: "idle" | "correct" | "incorrect", msg: string) => void; 
}) {
  const { playWord } = useWordAudio();

  // <-- MATRIX TRACKING -->
  const { trackInteraction } = useMatrix();
  const hasTrackedSeen = useRef(false);
  const heardWords = useRef<Set<string>>(new Set());

  const [availableWords, setAvailableWords] = useState<string[]>(item.scrambledBank);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [localStatus, setLocalStatus] = useState<"idle" | "correct" | "incorrect">("idle");

  // Track "seen" on mount
  useEffect(() => {
    if (!hasTrackedSeen.current && item.scrambledBank) {
      item.scrambledBank.forEach((w: string) => trackInteraction(w, { seen: 1 }));
      hasTrackedSeen.current = true;
    }
  }, [item.scrambledBank, trackInteraction]);

  const handleAddWord = (word: string, idx: number) => {
    playWord(word, "m");

    // Track "heard"
    if (!heardWords.current.has(word)) {
      trackInteraction(word, { heard: 1 });
      heardWords.current.add(word);
    }

    setLocalStatus("idle");
    onResolve("idle", "");
    setSelectedWords([...selectedWords, word]);
    const newAvailable = [...availableWords];
    newAvailable.splice(idx, 1);
    setAvailableWords(newAvailable);
  };

  const handleRemoveWord = (word: string, idx: number) => {
    setLocalStatus("idle");
    onResolve("idle", "");
    const newSelected = [...selectedWords];
    newSelected.splice(idx, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  };

  // Evaluate whenever they select all expected words
  useEffect(() => {
    if (selectedWords.length === item.expectedWords.length) {
      
      // Track correct/wrong taps
      selectedWords.forEach((word, i) => {
        if (word === item.expectedWords[i]) {
          trackInteraction(word, { tappedCorrect: 1 });
        } else {
          trackInteraction(word, { tappedWrong: 1 });
        }
      });

      const isPerfectMatch = selectedWords.every((word, i) => word === item.expectedWords[i]);
      if (isPerfectMatch) {
        setLocalStatus("correct");
        onResolve("correct", "✅ Spot on! Perfect sentence order.");
      } else {
        setLocalStatus("incorrect");
        onResolve("incorrect", "❌ Not quite right. Check your word order.");
      }
    }
  }, [selectedWords, item.expectedWords, onResolve, trackInteraction]);

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
      <h3 className="text-xl text-gray-500 font-medium mb-4 text-center">{item.prompt}</h3>
      
      {/* Drop Zone */}
      <div className={`min-h-[80px] w-full p-4 mb-8 rounded-2xl border-2 border-dashed flex flex-wrap gap-2 items-center transition-colors ${
        localStatus === "correct" ? "border-green-400 bg-green-50" : 
        localStatus === "incorrect" ? "border-red-400 bg-red-50" : 
        "border-gray-300 bg-gray-50"
      }`}>
        {selectedWords.length === 0 && (
          <span className="text-gray-400 font-medium w-full text-center">Tap words below to translate...</span>
        )}
        {selectedWords.map((word, idx) => (
          <button
            key={`sel-${idx}`}
            onClick={() => handleRemoveWord(word, idx)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-xs font-bold text-gray-800 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95 text-lg"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Word Bank */}
      <div className="flex flex-wrap justify-center gap-3">
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
    </div>
  );
}

// --------------------------------------------------------
// MAIN PARENT COMPONENT
// --------------------------------------------------------
export function QuizStep({ data, targetLang, onNext }: { data: any; targetLang: string; onNext: () => void }) {
  const { stopAudio } = useWordAudio();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [feedback, setFeedback] = useState<string>("");

  const totalQuestions = data.items.length;
  const currentItem = data.items[currentIndex];

  const handleResolve = (newStatus: "idle" | "correct" | "incorrect", msg: string) => {
    setStatus(newStatus);
    setFeedback(msg);
  };

  const handleNextQuestion = () => {
    stopAudio();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
      setStatus("idle");
      setFeedback("");
    } else {
      onNext(); // Proceed to conversational AI step!
    }
  };

  return (
    <div className="flex flex-col h-full p-8 overflow-y-auto">
      
      {/* Header & Progress */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">
            Knowledge Check
          </h2>
          <p className="text-gray-500 text-lg">
            Question {currentIndex + 1} of {totalQuestions}
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="flex gap-2">
          {data.items.map((_: any, idx: number) => (
            <div key={idx} className={`h-2.5 w-8 md:w-12 rounded-full transition-colors ${
              idx < currentIndex ? "bg-green-500" : idx === currentIndex ? "bg-blue-500" : "bg-gray-200"
            }`} />
          ))}
        </div>
      </div>

      {/* Dynamic Question Area */}
      <div className="flex-1 flex flex-col justify-center mb-8">
        {currentItem.type === "verbal_cloze" && (
          <VerbalClozeQuestion key={currentItem.prompt} item={currentItem} targetLang={targetLang} onResolve={handleResolve} />
        )}
        {currentItem.type === "true_false" && (
          <TrueFalseQuestion key={currentItem.statement} item={currentItem} onResolve={handleResolve} />
        )}
        {currentItem.type === "reorder" && (
          <ReorderQuestion key={currentItem.prompt} item={currentItem} onResolve={handleResolve} />
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto min-h-[80px] flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-gray-100 pt-6">
        <div className={`flex-1 font-medium text-lg flex items-center gap-2 animate-in fade-in ${
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