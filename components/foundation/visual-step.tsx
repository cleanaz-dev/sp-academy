"use client";

import React from "react";

export function VisualStep({ data, onNext }: { data: any; onNext: () => void }) {
  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Step 1: Setting the Scene</h2>
      
      {/* Context Area */}
      <div className="mb-6 p-4 bg-indigo-50 text-indigo-900 rounded-md border border-indigo-100">
        <p><strong>Context:</strong> {data.sceneDescription}</p>
      </div>
      
      {/* Scene Visualization */}
      <div className="my-4 p-4 bg-gray-100 rounded-md border text-center">
        {/* Placeholder for actual image fetcher */}
        <div className="w-full h-48 bg-gray-300 flex items-center justify-center rounded mb-4 text-gray-500 italic">
          [Image Mounts Here: {data.imageS3Key}]
        </div>
        
        <div className="inline-block bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-left">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">NPC Says:</p>
          <p className="text-lg font-medium text-gray-900">"{data.npcLine}"</p>
        </div>
      </div>

      <button 
        onClick={onNext} 
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded w-full sm:w-auto"
      >
        Next: Grammar Breakdown
      </button>
    </div>
  );
}