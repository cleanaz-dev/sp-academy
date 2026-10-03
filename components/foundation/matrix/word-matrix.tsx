"use client";

import React, { useEffect, useState } from "react";
import { 
  Loader2, 
  Trophy, 
  Eye, 
  Volume2, 
  Mic, 
  MousePointer2, 
  BrainCircuit,
  TrendingUp
} from "lucide-react";

type WordStat = {
  id: string;
  word: string;
  seenCount: number;
  heardCount: number;
  tappedCorrect: number;
  tappedWrong: number;
  spokenAttempts: number;
  avgSpokenScore: number | null;
  masteryScore: number;
  status: string;
};

export function WordMatrix({ userId, targetLang }: { userId: string; targetLang: string }) {
  const [words, setWords] = useState<WordStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMatrix = async () => {
      try {
        const res = await fetch(`/api/users/${userId}/matrix/${targetLang}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        
        // Sort by mastery score descending
        const sortedWords = (data.words || []).sort((a: WordStat, b: WordStat) => b.masteryScore - a.masteryScore);
        setWords(sortedWords);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatrix();
  }, [userId, targetLang]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 w-full animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400 font-medium animate-pulse">Compiling your neural matrix...</p>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-3xl border border-gray-200 text-gray-500">
        No words tracked yet. Start a lesson to build your matrix!
      </div>
    );
  }

  // --- Aggregate Stats ---
  const totalInteractions = words.reduce((acc, w) => acc + w.seenCount + w.heardCount + w.spokenAttempts + w.tappedCorrect + w.tappedWrong, 0);
  const averageMastery = Math.round(words.reduce((acc, w) => acc + w.masteryScore, 0) / words.length);
  const masteredCount = words.filter(w => w.masteryScore >= 80).length;

  const getMasteryColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-400 text-green-700 bg-green-50 border-green-200";
    if (score >= 50) return "from-blue-500 to-indigo-400 text-blue-700 bg-blue-50 border-blue-200";
    if (score >= 20) return "from-yellow-500 to-orange-400 text-yellow-700 bg-yellow-50 border-yellow-200";
    return "from-gray-400 to-slate-400 text-gray-600 bg-gray-50 border-gray-200";
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-in slide-in-from-bottom-4 duration-700 fade-in">
      
      {/* 🚀 Top Summary Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-gray-900 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><BrainCircuit size={120} /></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Neural Link Active</p>
          <div>
            <h3 className="text-5xl font-extrabold mb-1">{words.length}</h3>
            <p className="text-gray-300 font-medium">Unique words mapped</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Total Interactions</p>
            <TrendingUp className="text-blue-500" size={20} />
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-1">{totalInteractions}</h3>
            <p className="text-gray-500 font-medium">Views, listens, and speaks</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Overall Fluency</p>
            <Trophy className="text-yellow-500" size={20} />
          </div>
          <div>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-1">{averageMastery}%</h3>
            <p className="text-gray-500 font-medium">{masteredCount} words fully mastered</p>
          </div>
        </div>
      </div>

      {/* 🧠 Word Grid */}
      <div className="mb-6 flex items-center gap-3">
        <h3 className="text-xl font-extrabold text-gray-900">Vocabulary Matrix</h3>
        <div className="h-px flex-1 bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {words.map((word) => {
          const colorClasses = getMasteryColor(word.masteryScore);
          const bgGradient = colorClasses.split(' ').slice(0, 2).join(' '); // grabs the from-X to-Y
          const themeColors = colorClasses.split(' ').slice(2).join(' '); // grabs text, bg, border

          return (
            <div 
              key={word.id} 
              className={`relative bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md hover:-translate-y-1 ${themeColors}`}
            >
              {/* Top Row: Word & Mastery Pill */}
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-2xl font-bold text-gray-900 tracking-tight">{word.word}</h4>
                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-white/50 backdrop-blur-md border ${themeColors}`}>
                  {word.masteryScore}%
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-2 rounded-full mb-6 overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-linear-to-r ${bgGradient}`} 
                  style={{ width: `${Math.max(word.masteryScore, 5)}%` }}
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2">
                
                {/* Seen */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 shadow-xs" title="Times Seen">
                  <Eye size={16} className="text-gray-400 mb-1" />
                  <span className="font-bold text-gray-700 text-sm">{word.seenCount}</span>
                </div>
                
                {/* Heard */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 shadow-xs" title="Times Heard">
                  <Volume2 size={16} className="text-blue-400 mb-1" />
                  <span className="font-bold text-gray-700 text-sm">{word.heardCount}</span>
                </div>
                
                {/* Tapped (Accuracy) */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 shadow-xs" title="Selection Accuracy">
                  <MousePointer2 size={16} className={word.tappedWrong > 0 ? "text-yellow-500 mb-1" : "text-green-500 mb-1"} />
                  <span className="font-bold text-gray-700 text-sm">
                    {word.tappedCorrect}/{word.tappedCorrect + word.tappedWrong}
                  </span>
                </div>
                
                {/* Spoken (Score) */}
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white border border-gray-100 shadow-xs" title="Average Pronunciation Score">
                  <Mic size={16} className={word.avgSpokenScore && word.avgSpokenScore > 80 ? "text-green-500 mb-1" : "text-purple-400 mb-1"} />
                  <span className="font-bold text-gray-700 text-sm">
                    {word.spokenAttempts === 0 ? "-" : `${word.avgSpokenScore}%`}
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}