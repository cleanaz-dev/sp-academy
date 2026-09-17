"use client";

import React from "react";

export function VisualStep({ data, onNext }: { data: any; onNext: () => void }) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Step 1: Setting the Scene</h2>
      <p className="mb-2"><strong>Context:</strong> {data.sceneDescription}</p>
      
      <div className="my-4 p-4 bg-gray-100 rounded-md">
        <p className="text-gray-500 italic mb-4">[Image Placeholder: {data.imageS3Key}]</p>
        <p className="text-lg"><strong>Neighbor says:</strong> "{data.npcLine}"</p>
      </div>

      <button 
        onClick={onNext} 
        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
      >
        Next: Grammar Breakdown
      </button>
    </div>
  );
}