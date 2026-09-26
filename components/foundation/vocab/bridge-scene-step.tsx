"use client";
import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Play, Square, MessageCircle } from "lucide-react";

export function BridgeSceneStep({ data, onNext }: { data: any; onNext: () => void }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const toggleAudio = () => {
    if (isPlayingAudio) {
      audioRef.current?.pause();
      setIsPlayingAudio(false);
      return;
    }
    if (!data.npcAudioS3Key) return;
    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(data.npcAudioS3Key);
    audioRef.current = audio;
    audio.onended = () => setIsPlayingAudio(false);
    audio.play().catch(() => setIsPlayingAudio(false));
    setIsPlayingAudio(true);
  };

  const handleNext = () => {
    if (audioRef.current) audioRef.current.pause();
    onNext();
  };

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Scene Context</h2>
        <p className="text-gray-500 text-lg">Watch the scenario unfold before practicing.</p>
      </div>
      
      {/* Video / Image Display */}
      <div className="relative mb-12 w-full h-72 md:h-96 bg-gray-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
        {data.videoS3Key ? (
          <video src={data.videoS3Key} controls className="w-full h-full object-cover" poster={data.imageS3Key} />
        ) : (
          <img src={data.imageS3Key} alt={data.altText} className="w-full h-full object-cover" />
        )}

        {/* Floating NPC Quote */}
        <div className="absolute -bottom-0 left-0 right-0 p-6 bg-linear-to-t from-black/80 to-transparent">
          <div className="bg-white/95 backdrop-blur-md px-6 py-5 rounded-2xl shadow-xl max-w-2xl mx-auto flex gap-4 items-center">
            <button onClick={toggleAudio} className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${isPlayingAudio ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
              {isPlayingAudio ? <Square size={20} className="fill-current" /> : <Play size={20} className="fill-current ml-1" />}
            </button>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">NPC Says:</p>
              <p className="text-lg font-medium text-gray-900">"{data.npcLine}"</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto flex justify-end pt-6 border-t border-gray-100">
        <button onClick={handleNext} className="px-8 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-lg flex items-center gap-2 active:scale-95">
          Next: Learn Vocab <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}