"use client";

import React, { useState, useEffect } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { getPresignedImageUrl } from "@/lib/aws/services/s3-presigned-url";


export function VisualStep({ data, onNext }: { data: any; onNext: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(true);

  // Fetch the presigned URL when the component mounts or s3Key changes
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

  return (
    <div className="p-6 md:p-8 border border-slate-200 rounded-3xl bg-white shadow-sm max-w-3xl mx-auto text-slate-800">
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
          Step 1: Setting the Scene
        </h2>
        <p className="text-slate-500">
          Visualize the scenario before you begin speaking.
        </p>
      </div>
      
      {/* Context Area */}
      <div className="mb-6 p-5 bg-indigo-50 text-indigo-900 rounded-2xl border border-indigo-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="text-4xl shrink-0">📍</div>
        <p className="text-lg leading-relaxed font-medium">
          {data.sceneDescription || "You are standing outside in your neighborhood..."}
        </p>
      </div>
      
      {/* Scene Visualization */}
      <div className="my-6 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center relative">
        
        {/* Actual Image Fetcher & Display */}
        <div className="w-full h-64 md:h-80 bg-slate-200 rounded-xl overflow-hidden relative mb-4 flex items-center justify-center border border-slate-300">
          {isLoadingImage ? (
            <div className="flex flex-col items-center text-slate-500 gap-2">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-sm font-medium">Loading scene...</p>
            </div>
          ) : imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Scene Visualization" 
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex flex-col items-center text-slate-400 gap-2">
              <ImageIcon size={48} opacity={0.5} />
              <p className="text-sm italic">Image unavailable</p>
            </div>
          )}
        </div>
        
        {/* NPC Quote Overlapping/Below Image */}
        <div className="inline-block bg-white px-6 py-4 rounded-xl shadow-lg border border-slate-200 text-left -mt-8 relative z-10 max-w-[90%] mx-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">
            NPC Says:
          </p>
          <p className="text-xl font-medium text-slate-900 italic">
            "{data.npcLine}"
          </p>
        </div>
      </div>

      <button 
        onClick={onNext} 
        className="mt-6 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-lg shadow-lg shadow-blue-200 transition-transform active:scale-[0.98]"
      >
        Next: Grammar Breakdown
      </button>
    </div>
  );
}