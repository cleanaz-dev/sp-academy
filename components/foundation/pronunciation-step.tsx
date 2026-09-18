"use client";

import { usePronunciation } from "@/context/pronunciation-context";
import { useMiniAudioPlayer } from "@/hooks/use-mini-audio-player";
import React from "react";
import { Mic, Square, Volume2, ArrowRight, Activity, AlertCircle } from "lucide-react";

export function PronunciationStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { play, isPlaying, currentS3Key } = useMiniAudioPlayer();
  const { isRecording, score, error, assessSpeech, cancelAssessment } = usePronunciation();

  const targetLang = "fr-FR"; // In production, pass this down from the parent wrapper!

  const handleRecordToggle = () => {
    if (isRecording) {
      cancelAssessment();
    } else {
      assessSpeech(data.referenceText, targetLang);
    }
  };

  const isThisAudioPlaying = isPlaying && currentS3Key === data.audioS3Key;

  // Helper to render a score bar
  const ScoreBar = ({ label, value }: { label: string, value: number }) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-sm font-bold">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-900">{value}%</span>
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
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
      
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Pronunciation Lab
        </h2>
        <p className="text-gray-500 text-lg">
          Listen to the native speaker, then record yourself.
        </p>
      </div>
      
      {/* Target Sentence Display */}
      <div className="mb-6 p-8 bg-white rounded-2xl border-2 border-dashed border-gray-200 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-50 opacity-50 pointer-events-none">
          <Mic size={120} />
        </div>
        <p className="text-3xl md:text-4xl font-medium text-gray-900 leading-snug relative z-10">
          "{data.referenceText}"
        </p>
      </div>
      
      {/* Focus Sounds */}
      {data.focusSounds && data.focusSounds.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Focus Sounds:
          </span>
          {data.focusSounds.map((fs: any, idx: number) => (
            <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold border border-blue-100">
              {fs.sound}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <button 
          onClick={() => play(data.audioS3Key)}
          className={`flex-1 py-4 px-6 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all border shadow-sm ${
            isThisAudioPlaying 
              ? 'bg-blue-50 border-blue-200 text-blue-700 ring-4 ring-blue-50' 
              : 'bg-white hover:bg-gray-50 border-gray-200 text-gray-700'
          }`}
        >
          {isThisAudioPlaying ? <Square size={20} className="fill-current" /> : <Volume2 size={20} />}
          {isThisAudioPlaying ? "Playing Audio..." : "Play Reference"}
        </button>
        
        <button 
          onClick={handleRecordToggle}
          className={`flex-1 py-4 px-6 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all border shadow-sm ${
            isRecording 
              ? 'bg-red-50 border-red-200 text-red-600 ring-4 ring-red-500/20 animate-pulse' 
              : 'bg-gray-900 hover:bg-black border-gray-900 text-white'
          }`}
        >
          {isRecording ? <Square size={20} className="fill-current" /> : <Mic size={20} />}
          {isRecording ? "Stop Recording" : "Record Your Voice"}
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
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-sm animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="text-green-500" size={24} />
            <h3 className="font-extrabold text-gray-900 text-lg">Pronunciation Analysis</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <ScoreBar label="Pronunciation" value={score.pronunciationScore} />
            <ScoreBar label="Accuracy" value={score.accuracyScore} />
            <ScoreBar label="Fluency" value={score.fluencyScore} />
          </div>
        </div>
      )}

      <div className="mt-auto pt-6 flex justify-end">
        <button 
          onClick={onNext} 
          className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg shadow-md shadow-blue-500/20 transition-transform active:scale-95 flex items-center justify-center gap-2"
        >
          Next: Listening Comprehension <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}