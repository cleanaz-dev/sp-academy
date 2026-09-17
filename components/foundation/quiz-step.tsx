"use client";

import React from "react";

export function QuizStep({ data, onNext }: { data: any; onNext: () => void }) {
  const clozeItems = data.items.filter((item: any) => item.type === "cloze");

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Step 5: Knowledge Check</h2>
      
      <div className="flex flex-col gap-6">
        {clozeItems.map((item: any, idx: number) => (
          <div key={item.cloze.id} className="p-4 bg-gray-50 border rounded-md">
            <p className="font-semibold text-gray-700 mb-2">Question {idx + 1}</p>
            <p className="text-lg mb-3">{item.cloze.hostSentence.replace("___", "______")}</p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Type your answer..." 
                className="border p-2 rounded flex-1 focus:ring-2 focus:ring-blue-400 outline-none" 
              />
              <button className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
                Check
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onNext} 
        className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
      >
        Next: Freestyle Roleplay
      </button>
    </div>
  );
}