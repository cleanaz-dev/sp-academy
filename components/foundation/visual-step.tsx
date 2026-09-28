"use client";

import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Loader2, MapPin, ArrowRight, User, Play, Square } from "lucide-react";
// REMOVE THIS: import { getPresignedImageUrl } from "@/lib/aws/services/s3-presigned-url";
import { useS3Media } from "@/context/s3-context"; // <--- Import our new hook

export function VisualStep({ data, onNext }: { data: any; onNext: () => void }) {
  // --- NEW: Use the S3 Context hook for all media ---
  const { urls, isLoading: isLoadingMedia } = useS3Media([data.imageS3Key, data.npcAudioS3Key]);
  const [imageUrl, npcAudioUrl] = urls; // Destructure in order of keys passed to useS3Media

  // Track which valid reply the user selected
  const [selectedReply, setSelectedReply] = useState<number | null>(null);

  // Audio state & ref
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // REMOVE: Old useEffect for fetching image
  // useEffect(() => { /* ... old image fetch logic ... */ }, [data.imageS3Key]);

  // Cleanup audio if the component unmounts while playing
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

    // Use the URL from the S3 Context hook
    if (!npcAudioUrl) return; 

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(npcAudioUrl); // <--- Use resolved URL
    audioRef.current = audio;
    audio.onended = () => setIsPlayingAudio(false);
    
    audio.play().catch((err) => {
      console.warn("Audio playback skipped:", err);
      setIsPlayingAudio(false);
    });

    setIsPlayingAudio(true);
  };

  const handleNext = () => {
    // Ensure audio stops if they move to the next step
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onNext();
  };

  // Safely extract the constraints
  const validReplies = data.constraint?.validReplies || [];
  const requiredChunk = data.constraint?.requiredChunk || "";

  return (
    <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 overflow-y-auto">
      
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
          Setting the Scene
        </h2>
        <p className="text-gray-500 text-lg">
          Visualize the scenario and decide how to respond.
        </p>
      </div>
      
      {/* Context Area */}
      <div className="mb-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col md:flex-row gap-5 items-start md:items-center">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
          <MapPin size={24} />
        </div>
        <p className="text-md leading-relaxed text-gray-800 font-medium">
          {data.sceneDescription}
        </p>
      </div>
      
      {/* Scene Visualization & NPC Quote */}
      <div className="relative mb-12">
        <div className="w-full h-72 md:h-96 bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-200 flex items-center justify-center shadow-inner">
          {isLoadingMedia ? ( // <--- Use isLoadingMedia
            <div className="flex flex-col items-center text-gray-400 gap-3">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-sm font-medium tracking-wide">Loading simulation area...</p>
            </div>
          ) : imageUrl ? ( // <--- Use imageUrl
            <img 
              src={imageUrl} 
              alt={data.altText} 
              className="object-cover w-full h-full animate-in fade-in duration-1000"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400 gap-2">
              <ImageIcon size={48} opacity={0.3} />
              <p className="text-sm italic">Image unavailable</p>
            </div>
          )}
        </div>
        
        {/* NPC Quote Overlapping Image */}
        <div className="absolute -bottom-6 left-0 right-0 px-6 animate-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-backwards">
          <div className="bg-white px-6 py-5 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 max-w-2xl mx-auto flex gap-4 items-center">
            
            {/* Interactive Play Button replaces the static MessageCircle icon */}
            <button 
              onClick={toggleAudio}
              disabled={isLoadingMedia || !npcAudioUrl} // <--- Use isLoadingMedia and npcAudioUrl
              className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${
                isLoadingMedia || !npcAudioUrl ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : // <--- Use isLoadingMedia and npcAudioUrl
                isPlayingAudio 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100'
              }`}
            >
              {isLoadingMedia ? ( // <--- Add loading spinner for audio button too
                <Loader2 size={20} className="animate-spin" />
              ) : isPlayingAudio ? (
                <Square size={20} className="fill-current" />
              ) : (
                <Play size={20} className="fill-current ml-1" />
              )}
            </button>

            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                NPC Says:
              </p>
              <p className="text-lg font-medium text-gray-900 leading-snug">
                "{data.npcLine}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RPG-Style Dialogue Selector */}
      {validReplies.length > 0 && (
        <div className="mb-8 animate-in fade-in delay-700 fill-mode-backwards mt-4">
          <div className="flex items-center gap-3 mb-4">
            <User className="text-indigo-500" size={20} />
            <h3 className="font-bold text-gray-900">Choose your response:</h3>
            <span className="ml-auto text-xs font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
              Required: "{requiredChunk}"
            </span>
          </div>
          
          <div className="flex flex-col gap-3">
            {validReplies.map((reply: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedReply(idx)}
                className={`p-4 text-left font-medium rounded-xl border-2 transition-all duration-300 ${
                  selectedReply === idx 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs ring-4 ring-indigo-500/10' 
                    : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Next Button - Unlocks when they pick a reply */}
      <div className="mt-auto pt-8 flex justify-end border-t border-gray-100">
        <button 
          onClick={handleNext} 
          disabled={selectedReply === null && validReplies.length > 0}
          className={`w-full sm:w-auto px-8 py-4 font-bold rounded-xl text-lg transition-all flex items-center justify-center gap-2 ${
            selectedReply !== null || validReplies.length === 0
              ? 'bg-gray-900 hover:bg-black text-white shadow-md active:scale-95' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          Next: Grammar Breakdown <ArrowRight size={20} />
        </button>
      </div>
      
    </div>
  );
}