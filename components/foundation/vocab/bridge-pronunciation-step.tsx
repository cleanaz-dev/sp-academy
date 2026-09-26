"use client";
import React from "react";
import { Mic, ArrowRight, Activity, AlertCircle, CheckCircle2, Ear, Square } from "lucide-react";
import { usePronunciation } from "@/context/pronunciation-context";

export function BridgePronunciationStep({ data, onNext }: { data: any; onNext: () => void }) {
  const { isRecording, score, error, assessSpeech, cancelAssessment } = usePronunciation();

  const handleRecordToggle = () => {
    if (isRecording) {
      cancelAssessment();
    } else {
      assessSpeech(data.referenceText, "fr-FR"); // Engine is specified as "azure" in payload
    }
  };

  const focusSound = data.focusSounds?.[0];

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Final Pronunciation Check</h2>
        <p className="text-gray-500 text-lg">One last check to ensure you've mastered the target phrase.</p>
      </div>
      
      <div className="mb-8 p-10 bg-white rounded-3xl border border-gray-200 shadow-xs text-center relative overflow-hidden">
        <Mic size={160} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gray-50 opacity-40 pointer-events-none" />
        <p className="text-4xl font-bold text-gray-900 leading-snug relative z-10 mb-6">"{data.referenceText}"</p>
        
        {focusSound && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-700 text-sm font-bold border border-purple-200 relative z-10">
            <Ear size={16} /> Focus: {focusSound.sound}
          </div>
        )}
      </div>

      <div className="flex justify-center mb-8">
        <button 
          onClick={handleRecordToggle}
          className={`w-full sm:w-80 py-5 px-6 font-bold rounded-2xl flex items-center justify-center gap-3 transition-all border shadow-xs text-lg ${
            isRecording ? 'bg-red-50 border-red-200 text-red-600 ring-4 ring-red-500/20 animate-pulse' : 'bg-gray-900 hover:bg-black border-gray-900 text-white'
          }`}
        >
          {isRecording ? <Square size={24} className="fill-current" /> : <Mic size={24} />}
          {isRecording ? "Stop Recording" : "Record"}
        </button>
      </div>

      {score && (
        <div className="mb-8 p-6 bg-white rounded-2xl border border-gray-200 shadow-xs animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-extrabold text-gray-900 text-lg flex items-center gap-2"><Activity className="text-indigo-500" /> Analysis</h3>
            {score.pronunciationScore >= 80 && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-bold"><CheckCircle2 size={16} /> Great job!</span>
            )}
          </div>
          <div className="flex justify-between px-4 font-bold text-lg text-gray-700">
            <span>Score:</span>
            <span className={score.pronunciationScore >= 80 ? 'text-green-600' : 'text-orange-500'}>{score.pronunciationScore}%</span>
          </div>
        </div>
      )}

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-start gap-3"><AlertCircle size={20} /> <p>{error}</p></div>}

      <div className="mt-auto flex justify-end pt-6 border-t border-gray-100">
        <button onClick={onNext} disabled={isRecording} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-lg shadow-md active:scale-95 disabled:opacity-50">
          Complete Bridge <ArrowRight size={20} className="inline ml-2" />
        </button>
      </div>
    </div>
  );
}