"use client";

import { useState } from "react";
import { Mic2, Settings2, User2, Play, Sparkles, Globe2, BarChart3 } from "lucide-react";

const MODES = [
  { id: "INTRODUCTION", label: "Introduction", icon: "👋" },
  { id: "SPECIFIC", label: "Specific Topic", icon: "🎯" },
  { id: "RANDOM", label: "Random", icon: "🎲" },
  { id: "ARGUMENTATIVE", label: "Debate", icon: "⚖️" }
];

const LEVELS = [
  { id: "EASY", label: "Easy", desc: "Simple vocab, slow pace", color: "emerald" },
  { id: "MEDIUM", label: "Medium", desc: "Natural speed, some idioms", color: "amber" },
  { id: "FLUENT", label: "Fluent", desc: "Native speed, complex topics", color: "rose" },
];

const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "it-IT", label: "Italian" },
];

export default function FreestyleSetup({ onStart, defaultNative = "en-US", defaultTarget = "fr-FR" }: any) {
  const [mode, setMode] = useState("RANDOM");
  const [level, setLevel] = useState("EASY");                    // <-- ADD
  const [topic, setTopic] = useState("");
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("female");
  const [nativeLang, setNativeLang] = useState(defaultNative);
  const [targetLang, setTargetLang] = useState(defaultTarget);
  const [isStarting, setIsStarting] = useState(false);

  const handleStart = async () => {
    const silentAudio = new Audio("data:audio/mp3;base64,//MkxAA...");
    silentAudio.play().catch(() => {});

    setIsStarting(true);
    await onStart({
      mode,
      level,                                                    // <-- PASS LEVEL
      topic: mode === "SPECIFIC" ? topic : undefined,
      nativeLanguage: nativeLang,
      targetLanguage: targetLang,
      voiceGender,
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl p-8 shadow-2xl shadow-blue-900/5">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configure Freestyle</h2>
          <p className="text-gray-500">3-minute unscripted fluency challenge</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Language Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-blue-500" /> Native Language
            </label>
            <select
              value={nativeLang}
              onChange={(e) => setNativeLang(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all font-medium text-gray-700 cursor-pointer appearance-none"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-indigo-500" /> Target Language
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full p-4 bg-indigo-50/30 border-2 border-indigo-100 rounded-2xl focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-indigo-900 cursor-pointer appearance-none"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Level Selector — NEW */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" /> Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 ${
                  level === l.id
                  ? `border-${l.color}-600 bg-${l.color}-50/50 shadow-md ring-4 ring-${l.color}-600/10`
                  : "border-gray-100 bg-white hover:border-gray-200"
                }`}
              >
                <span className="font-bold text-sm text-gray-800">{l.label}</span>
                <span className="text-xs text-gray-500 leading-tight">{l.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-500" /> Challenge Mode
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-2 ${
                  mode === m.id 
                  ? "border-blue-600 bg-blue-50/50 shadow-md ring-4 ring-blue-600/10" 
                  : "border-gray-100 bg-white hover:border-blue-200"
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <span className="font-semibold text-sm text-gray-800">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Specific Topic Input */}
        {mode === "SPECIFIC" && (
          <div className="animate-in slide-in-from-top-2 fade-in duration-300">
            <input
              type="text"
              placeholder="What do you want to talk about? (e.g., Returning shoes at a store)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>
        )}

        {/* Voice Gender Selector */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <User2 className="w-4 h-4 text-blue-500" /> AI Tutor Voice
          </label>
          <div className="flex gap-4">
            {(["female", "male"] as const).map((gender) => (
              <button
                key={gender}
                onClick={() => setVoiceGender(gender)}
                className={`flex-1 p-4 rounded-2xl border-2 transition-all flex justify-center items-center gap-3 ${
                  voiceGender === gender 
                  ? "border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-md ring-4 ring-indigo-600/10" 
                  : "border-gray-100 bg-white text-gray-500 hover:border-indigo-200"
                }`}
              >
                <span className="font-bold capitalize">{gender} Voice</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={isStarting}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {isStarting ? (
            <span className="animate-pulse">Preparing Arena...</span>
          ) : (
            <>
              <Play className="w-6 h-6 fill-current" /> Enter Freestyle Arena
            </>
          )}
        </button>
      </div>
    </div>
  );
}