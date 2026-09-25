"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Loader2, MapPin, MessageCircle, ArrowRight, User } from "lucide-react";
import { getPresignedImageUrl } from "@/lib/aws/services/s3-presigned-url";

export function VisualStep({ data, onNext }: { data: any; onNext: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(true);
  
  // Track which valid reply the user selected
  const [selectedReply, setSelectedReply] = useState<number | null>(null);

  useEffect(() => {
    async function fetchImage() {
      if (!data.imageS3Key) {
        setIsLoadingImage(false);
        return;
      }
      setIsLoadingImage(true);
      const url = await getPresignedImageUrl(data.imageS3Key);
      setImageUrl(url);
      setIsLoadingImage(false);
    }
    fetchImage();
  }, [data.imageS3Key]);

  // Safely extract the constraints
  const validReplies = data.constraint?.validReplies || [];
  const requiredChunk = data.constraint?.requiredChunk || "";

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
      
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
        <p className="text-lg leading-relaxed text-gray-800 font-medium">
          {data.sceneDescription}
        </p>
      </div>
      
      {/* Scene Visualization & NPC Quote */}
      <div className="relative mb-12">
        <div className="w-full h-72 md:h-96 bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-200 flex items-center justify-center shadow-inner">
          {isLoadingImage ? (
            <div className="flex flex-col items-center text-gray-400 gap-3">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="text-sm font-medium tracking-wide">Loading simulation area...</p>
            </div>
          ) : imageUrl ? (
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
          <div className="bg-white px-6 py-5 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 max-w-2xl mx-auto flex gap-4 items-start">
            <MessageCircle className="text-blue-500 shrink-0 mt-1" size={24} />
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                NPC Says:
              </p>
              <p className="text-xl font-medium text-gray-900 leading-snug">
                "{data.npcLine}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RPG-Style Dialogue Selector (Using your constraint data!) */}
      {validReplies.length > 0 && (
        <div className="mb-8 animate-in fade-in delay-700 fill-mode-backwards">
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
          onClick={onNext} 
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