"use client";
import React, { useEffect } from "react";
import { ArrowRight, Volume2 } from "lucide-react";
import { useWordAudio } from "@/context/word-audio-context";
import { useMatrix } from "@/context/matrix-context";
import { useSpeakWord, cleanWord } from "@/components/foundation/word-tap"; // adjust path

export function VocabMomentStep({ data, onNext }: { data: any[]; onNext: () => void }) {
  const { activeWord, isPlaying, stopAudio } = useWordAudio();
  const { trackInteraction } = useMatrix();
  const speak = useSpeakWord();

  // Matrix: every vocab word shown on this screen counts as "seen" once
  useEffect(() => {
    data.forEach((item) => {
      const key = cleanWord(item.word);
      if (key) trackInteraction(key, { seen: 1 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNext = () => {
    stopAudio();
    onNext();
  };

  return (
    <div className="flex flex-col h-full p-8 md:p-12 animate-in fade-in duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Core Vocabulary</h2>
        <p className="text-gray-500 text-lg">Tap to hear pronunciation and review the definitions.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {data.map((item, idx) => {
          const active = isPlaying && activeWord === item.word;
          return (
            <button
              key={idx}
              onClick={() => speak(item.word)}
              className={`group flex flex-col items-center justify-center p-8 border-2 rounded-3xl transition-all shadow-xs hover:shadow-md active:scale-95 text-center ${
                active
                  ? "border-indigo-400 bg-indigo-50"
                  : "bg-white border-gray-100 hover:border-indigo-300 hover:bg-indigo-50/50"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-colors shadow-inner ${
                  active
                    ? "bg-indigo-500 text-white"
                    : "bg-indigo-50 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white"
                }`}
              >
                <Volume2 size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.word}</h3>
              <p className="text-gray-500 font-medium text-lg">{item.gloss}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex justify-center pt-6 border-t border-gray-100">
        <button
          onClick={handleNext}
          className="w-full sm:w-auto px-12 py-4 bg-gray-900 hover:bg-black text-white font-bold rounded-xl text-lg flex items-center justify-center gap-2 active:scale-95 shadow-md"
        >
          Begin Cooldown Drills <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}