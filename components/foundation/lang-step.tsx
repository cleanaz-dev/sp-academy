"use client";

import React from "react";
import { Languages, ArrowRight } from "lucide-react";

interface LangStepProps {
  onSelect: (lang: "FR" | "ES") => void;
}

export function LangStep({ onSelect }: LangStepProps) {
  return (
    <div className="flex flex-col h-full p-8 animate-in fade-in duration-500 max-w-4xl mx-auto w-full justify-center">
      
      {/* Header */}
      <div className="mb-12 text-center">
        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
          Prototype Environment
        </h3>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Select Target Language
        </h1>
        <p className="text-lg text-gray-600 max-w-lg mx-auto">
          Choose which mock dataset you want to load for this session.
        </p>
      </div>

      {/* Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto w-full mb-12">
        
        {/* French Option */}
        <button
          onClick={() => onSelect("FR")}
          className="flex flex-col items-center text-center gap-4 p-8 bg-white border-2 border-gray-100 hover:border-blue-500 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 group"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
            <Languages size={32} />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900 mb-1">French</div>
            <div className="text-sm font-medium text-gray-500">EN → FR Dataset</div>
          </div>
          <div className="mt-4 flex items-center text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Load Dataset <ArrowRight size={16} className="ml-1" />
          </div>
        </button>

        {/* Spanish Option */}
        <button
          onClick={() => onSelect("ES")}
          className="flex flex-col items-center text-center gap-4 p-8 bg-white border-2 border-gray-100 hover:border-blue-500 rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-95 group"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
            <Languages size={32} />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900 mb-1">Spanish</div>
            <div className="text-sm font-medium text-gray-500">EN → ES Dataset</div>
          </div>
          <div className="mt-4 flex items-center text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Load Dataset <ArrowRight size={16} className="ml-1" />
          </div>
        </button>

      </div>
    </div>
  );
}