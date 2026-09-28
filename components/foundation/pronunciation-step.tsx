"use client";

import { usePronunciation } from "@/context/pronunciation-context";
import { useSpeak } from "@/hooks/use-speak";
import { useS3Media } from "@/context/s3-context"; // <--- 1. Import Hook
import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Volume2, ArrowRight, Activity, AlertCircle, CheckCircle2, Ear, Loader2 } from "lucide-react";

export function PronunciationStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { speak, isPlaying: isPlayingTTS, stop: stopTTS } = useSpeak();
  const { isRecording, score, error, assessSpeech, cancelAssessment, reset } = usePronunciation();

  // --- 2. Resolve the Full Sentence Audio Key via Context ---
  const { urls, isLoading: isS3Loading } = useS3Media([data.audioS3Key]);
  const fullSentenceAudioUrl = urls[0];

  // State to track which word/chunk we are practicing
  const [currentIndex, setCurrentIndex] = useState(0);

  // S3 Audio State for the full sentence
  const [isPlayingS3, setIsPlayingS3] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // If there's no breakdown array (fallback to old JSON), just use the full sentence
  const breakdown = data.breakdown || [];
  const totalSteps = breakdown.length + 1; // All words + 1 for the final full sentence
  const isFullSentenceStep = currentIndex === breakdown.length;

  // Get current text based on step
  const currentText = isFullSentenceStep ? data.referenceText : breakdown[currentIndex].text;
  const currentPhonetic = isFullSentenceStep ? null : breakdown[currentIndex].phonetic;
  const currentHint = isFullSentenceStep ? "Put it all together!" : breakdown[currentIndex].hint;
  
  // Check if the current word has a specific "focus sound" from the new JSON
  const activeFocusSound = data.focusSounds?.find((fs: any) => fs.positions.includes(currentIndex));

  const targetLang = "fr-FR"; 

  // Reset Azure's score and stop audio when we switch words
  useEffect(() => {
    reset();
    stopAudio();
  }, [currentIndex, reset]);

  // Cleanup audio if component unmounts
  useEffect(() => {
    return () => stopAudio();
  }, []);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlayingS3(false);
    stopTTS();
  };

  const handleRecordToggle = () => {
    stopAudio();
    if (isRecording) {
      cancelAssessment();
    } else {
      assessSpeech(currentText, targetLang);
    }
  };

  // --- 3. Use the resolved URL instead of passing the raw key ---
  const toggleS3Audio = () => {
    if (isPlayingS3) {
      stopAudio();
      return;
    }
    if (!fullSentenceAudioUrl) return; // Guard against empty URL

    stopTTS();
    
    const audio = new Audio(fullSentenceAudioUrl);
    audioRef.current = audio;
    audio.onended = () => setIsPlayingS3(false);
    
    audio.play().catch(err => {
      console.warn("Audio playback skipped:", err);
      setIsPlayingS3(false);
    });
    
    setIsPlayingS3(true);
  };

  const handlePlayAudio = () => {
    if (isRecording) return; // Don't play if mic is hot

    if (isFullSentenceStep && data.audioS3Key) {
      toggleS3Audio(); // No longer needs parameter
    } else {
      // Use browser TTS for the individual words
      if (isPlayingTTS) {
        stopTTS();
      } else {
        stopAudio();
        speak(currentText, targetLang);
      }
    }
  };

  const isAudioActive = isPlayingS3 || isPlayingTTS;
  
  // Calculate if the listen button should be disabled or show loading
  const isWaitingForS3 = isFullSentenceStep && isS3Loading;
  const isPlayDisabled = isRecording || isWaitingForS3 || (isFullSentenceStep && !fullSentenceAudioUrl && !!data.audioS3Key);

  const handleNextWord = () => {
    stopAudio();
    if (currentIndex < totalSteps - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onNext(); // Advance to Listening Step
    }
  };

  // Helper for rendering Azure score bars
  const ScoreBar = ({ label, value }: { label: string, value: number }) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
        <span className="text-gray-500">{label}</span>
        <span className={value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600'}>
          {value}%
        </span>
      </div>
      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${
            value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-400' : 'bg-red-500'
          }`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 overflow-y-auto">
      
      {/* Header & Progress */}
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
          Pronunciation Lab
        </h2>
        
        {/* Step Indicator (Dots) */}
        <div className="flex items-center justify-center gap-2 mb-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-8 bg-blue-600' : 
                idx < currentIndex ? 'w-2.5 bg-green-500' : 'w-2.5 bg-gray-200'
              }`}
            />
          ))}
        </div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          {isFullSentenceStep ? "Final Step: Full Sentence" : `Part ${currentIndex + 1} of ${totalSteps - 1}`}
        </p>
      </div>
      
      {/* Target Flashcard */}
      <div className="mb-8 p-10 bg-white rounded-3xl border border-gray-200 shadow-xs text-center relative overflow-hidden transition-all duration-500">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-50 opacity-40 pointer-events-none">
          <Mic size={160} />
        </div>
        
        <p className="text-4xl md:text-5xl font-bold text-gray-900 leading-snug relative z-10 mb-4 tracking-tight">
          "{currentText}"
        </p>
        
        {currentPhonetic && (
          <p className="text-lg font-mono text-gray-400 relative z-10 mb-6">
            /{currentPhonetic}/
          </p>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
          {activeFocusSound && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-sm font-bold border border-purple-200">
              <Ear size={16} /> Focus: {activeFocusSound.sound}
            </div>
          )}
          {currentHint && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-bold border border-blue-100">
              <Activity size={16} /> {currentHint}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons (Play / Record) */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button 
          onClick={handlePlayAudio}
          disabled={isPlayDisabled} // <--- 4. Disable if recording OR waiting for S3
          className={`flex-1 py-5 px-6 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all border shadow-xs text-lg disabled:opacity-50 ${
            isAudioActive 
              ? 'bg-blue-50 border-blue-200 text-blue-700 ring-4 ring-blue-50' 
              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300'
          }`}
        >
          {/* Show spinner if waiting for S3 */}
          {isWaitingForS3 ? <Loader2 size={24} className="animate-spin text-gray-400" /> : 
           isAudioActive ? <Square size={24} className="fill-current" /> : <Volume2 size={24} />}
          {isAudioActive ? "Stop" : "Listen"}
        </button>
        
        <button 
          onClick={handleRecordToggle}
          className={`flex-1 py-5 px-6 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all border shadow-xs text-lg ${
            isRecording 
              ? 'bg-red-50 border-red-200 text-red-600 ring-4 ring-red-500/20 animate-pulse' 
              : 'bg-gray-900 hover:bg-black border-gray-900 text-white'
          }`}
        >
          {isRecording ? <Square size={24} className="fill-current" /> : <Mic size={24} />}
          {isRecording ? "Stop Recording" : "Record"}
        </button>
      </div>

      {/* AZURE RESULTS DISPLAY */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {score && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-xs animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-500" size={24} />
              <h3 className="font-extrabold text-gray-900 text-lg">Analysis</h3>
            </div>
            {score.pronunciationScore >= 80 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                <CheckCircle2 size={16} /> Great job!
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ScoreBar label="Pronunciation" value={score.pronunciationScore} />
            <ScoreBar label="Accuracy" value={score.accuracyScore} />
            <ScoreBar label="Fluency" value={score.fluencyScore} />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-auto pt-6 flex justify-end border-t border-gray-100">
        <button 
          onClick={handleNextWord} 
          disabled={isRecording}
          className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isFullSentenceStep ? "Finish Practice" : "Next Word"} <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
}