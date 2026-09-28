"use client";

import React, { useState, useRef, useEffect } from "react";
import { MapPin, Play, Square, Loader2, ArrowRight, User, CheckCircle2 } from "lucide-react";
import { useS3Media } from "@/context/s3-context";

export function VisualStep({ data, onNext }: { data: any; onNext: () => void }) {
  // Resolve Image and NPC Audio URLs
  const { urls, isLoading: isMediaLoading } = useS3Media([data.imageS3Key, data.npcAudioS3Key]);
  const [imageUrl, audioUrl] = urls;

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedReply, setSelectedReply] = useState<string | null>(null);

  // Audio cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play().catch(e => {
      console.warn("Audio playback skipped:", e);
      setIsPlaying(false);
    });
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (audioRef.current) audioRef.current.pause();
    onNext();
  };

  return (
    <div className="flex flex-col h-full p-6 md:p-8 overflow-y-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-4 shrink-0">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">
          Setting the Scene
        </h2>
        <p className="text-gray-500 text-sm md:text-base">
          Visualize the scenario and decide how to respond.
        </p>
      </div>

      {/* COMPACT Scene Description */}
      <div className="flex items-start gap-2.5 mb-6 shrink-0 text-gray-700">
        <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-sm font-medium leading-snug">
          {data.sceneDescription}
        </p>
      </div>

      {/* Image & NPC Dialogue - Width constrained to maintain aspect ratio without cropping */}
      <div className="w-full max-w-xl mx-auto flex flex-col items-center mb-6 shrink-0">
        {/* Full Image (No Cropping) */}
        <div className="w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[150px]">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={data.altText} 
              // h-auto ensures it scales naturally based on its true aspect ratio (1344x768 or 1280x960)
              className="w-full h-auto object-contain block" 
            />
          ) : (
            <div className="w-full py-20 flex items-center justify-center">
              {isMediaLoading ? <Loader2 className="animate-spin text-gray-300 w-8 h-8" /> : <span className="text-gray-400 text-sm">Image not found</span>}
            </div>
          )}
        </div>

        {/* Floating NPC Dialogue Box - Pulled out and overlapped using negative margin (-mt-8) */}
        <div className="w-11/12 sm:w-10/12 bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-xl shadow-lg border border-gray-100/50 flex gap-3 sm:gap-4 items-center relative z-10 -mt-8">
          <button
            onClick={toggleAudio}
            disabled={isMediaLoading || !audioUrl}
            className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
              isMediaLoading ? "bg-gray-100 text-gray-400" :
              isPlaying ? "bg-blue-100 text-blue-700 ring-2 ring-blue-50" :
              "bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
            }`}
          >
            {isMediaLoading && audioUrl === undefined ? <Loader2 size={18} className="animate-spin" /> :
             isPlaying ? <Square size={18} className="fill-current" /> :
             <Play size={18} className="fill-current ml-1" />}
          </button>
          <div className="flex-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">NPC SAYS:</span>
            <p className="text-sm sm:text-base font-medium text-gray-900 leading-snug">"{data.npcLine}"</p>
          </div>
        </div>
      </div>

      {/* Required Chunk & Choice Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-sm sm:text-base">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          Choose your response:
        </div>
        {data.constraint?.requiredChunk && (
          <div className="px-3 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-100 uppercase tracking-wide shrink-0">
            Required: "{data.constraint.requiredChunk}"
          </div>
        )}
      </div>

      {/* Options - Tighter gaps and smaller padding */}
      <div className="flex flex-col gap-2 mb-4 shrink-0">
        {data.constraint?.validReplies?.map((reply: string, idx: number) => (
          <button
            key={idx}
            onClick={() => setSelectedReply(reply)}
            className={`text-left px-4 py-3 sm:p-4 rounded-xl border-2 transition-all shadow-xs ${
              selectedReply === reply
                ? "border-blue-500 bg-blue-50 text-blue-900"
                : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50 text-gray-700"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm sm:text-base font-medium">{reply}</span>
              {selectedReply === reply && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
            </div>
          </button>
        ))}
      </div>

      {/* Footer Action */}
      <div className="mt-auto shrink-0 flex justify-end">
         <button
          onClick={handleNext}
          disabled={!selectedReply}
          className={`w-full sm:w-auto px-6 py-3 font-bold rounded-xl text-base transition-all shadow-sm flex items-center justify-center gap-2 ${
            selectedReply
              ? "bg-gray-900 hover:bg-black text-white active:scale-95"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
         >
           Next: Grammar & Meaning <ArrowRight size={18} />
         </button>
      </div>

    </div>
  );
}