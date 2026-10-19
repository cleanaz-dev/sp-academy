"use client";

import { useState } from "react";
import {
  Settings2,
  Play,
  Sparkles,
  Globe2,
  BarChart3,
  Mic,
  CheckCircle2,
  Volume2,
  MessageSquarePlus,
  Loader2,
} from "lucide-react";

const MODES = [
  {
    id: "INTRODUCTION",
    label: "Introduction",
    tagline: "First impressions & small talk",
    icon: "👋",
  },
  {
    id: "RANDOM",
    label: "Surprise Me",
    tagline: "Spontaneous everyday situations",
    icon: "🎲",
  },
  {
    id: "SPECIFIC",
    label: "Custom Topic",
    tagline: "Roleplay any scenario you want",
    icon: "🎯",
  },
  {
    id: "ARGUMENTATIVE",
    label: "Friendly Debate",
    tagline: "Defend your opinion & persuade",
    icon: "⚖️",
  },
];

// Full static Tailwind classes so Tailwind JIT compiles every color properly
const LEVELS = [
  {
    id: "ZERO",
    label: "Zero",
    badge: "A0 Starter",
    desc: "Ultra-short phrases, patient hints",
    activeClass:
      "border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/15 text-sky-950",
    badgeClass: "bg-sky-100 text-sky-700",
    dotClass: "bg-sky-500",
  },
  {
    id: "EASY",
    label: "Easy",
    badge: "A1–A2",
    desc: "Simple vocabulary, slow & clear pace",
    activeClass:
      "border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/15 text-emerald-950",
    badgeClass: "bg-emerald-100 text-emerald-700",
    dotClass: "bg-emerald-500",
  },
  {
    id: "MEDIUM",
    label: "Medium",
    badge: "B1–B2",
    desc: "Natural cadence, everyday idioms",
    activeClass:
      "border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/15 text-amber-950",
    badgeClass: "bg-amber-100 text-amber-800",
    dotClass: "bg-amber-500",
  },
  {
    id: "FLUENT",
    label: "Fluent",
    badge: "C1+",
    desc: "Native speed, nuanced topics",
    activeClass:
      "border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/15 text-rose-950",
    badgeClass: "bg-rose-100 text-rose-700",
    dotClass: "bg-rose-500",
  },
] as const;

const SUPPORTED_LANGUAGES = [
  { code: "en-US", label: "English (US)", flag: "🇺🇸" },
  { code: "fr-FR", label: "French", flag: "🇫🇷" },
  { code: "es-ES", label: "Spanish", flag: "🇪🇸" },
  { code: "de-DE", label: "German", flag: "🇩🇪" },
  { code: "it-IT", label: "Italian", flag: "🇮🇹" },
];

const QUICK_TOPICS = [
  "Ordering coffee & pastries at a Parisian café",
  "Asking a local for directions to the metro",
  "Introducing yourself to a new neighbor",
  "Checking into a boutique hotel",
  "Returning an item at a clothing shop",
];

function normalizeLangCode(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  const upper = raw.toUpperCase();
  if (upper === "ENGLISH" || upper === "EN" || upper === "EN-US") return "en-US";
  if (upper === "FRENCH" || upper === "FR" || upper === "FR-FR") return "fr-FR";
  if (upper === "SPANISH" || upper === "ES" || upper === "ES-ES") return "es-ES";
  if (upper === "GERMAN" || upper === "DE" || upper === "DE-DE") return "de-DE";
  if (upper === "ITALIAN" || upper === "IT" || upper === "IT-IT") return "it-IT";
  return SUPPORTED_LANGUAGES.some((l) => l.code === raw) ? raw : fallback;
}

export default function FreestyleSetup({
  onStart,
  defaultNative = "en-US",
  defaultTarget = "fr-FR",
}: any) {
  const [mode, setMode] = useState("RANDOM");
  const [level, setLevel] = useState<"ZERO" | "EASY" | "MEDIUM" | "FLUENT">(
    "ZERO"
  );
  const [topic, setTopic] = useState("");
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("female");
  const [nativeLang, setNativeLang] = useState(() =>
    normalizeLangCode(defaultNative, "en-US")
  );
  const [targetLang, setTargetLang] = useState(() =>
    normalizeLangCode(defaultTarget, "fr-FR")
  );
  const [isStarting, setIsStarting] = useState(false);

  const selectedModeObj = MODES.find((m) => m.id === mode) ?? MODES[1];
  const selectedLevelObj = LEVELS.find((l) => l.id === level) ?? LEVELS[0];
  const targetLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) ??
    SUPPORTED_LANGUAGES[1];

  const handleStart = async () => {
    const silentAudio = new Audio("data:audio/mp3;base64,//MkxAA...");
    silentAudio.play().catch(() => {});

    setIsStarting(true);
    await onStart({
      mode,
      level,
      topic: mode === "SPECIFIC" ? topic : undefined,
      nativeLanguage: nativeLang,
      targetLanguage: targetLang,
      voiceGender,
    });
  };

  const previewAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${
    voiceGender === "female" ? "Camille" : "Laurent"
  }&style=circle&top=${voiceGender === "female" ? "longHair" : "shortHair"}`;

  return (
    <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12">
      {/* LEFT / MAIN CONFIGURATION COLUMN (8 COLS) */}
      <div className="flex flex-col gap-6 lg:col-span-8">
        {/* 1. CONVERSATION MODE CARD */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Settings2 className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  1. Pick Your Conversation Mode
                </h2>
                <p className="text-xs text-slate-500">
                  Choose how your AI partner should steer the conversation
                </p>
              </div>
            </div>
            <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-extrabold text-indigo-600 uppercase sm:inline-block">
              Step 1 of 2
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MODES.map((m) => {
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`group relative flex items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-600/10"
                      : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-2xs">
                    {m.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-slate-900">
                        {m.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                      {m.tagline}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Specific Topic Input + Quick Suggestions */}
          {mode === "SPECIFIC" && (
            <div className="mt-4 space-y-3 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
              <label className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-indigo-900 uppercase">
                <MessageSquarePlus className="h-3.5 w-3.5 text-indigo-600" />
                What scenario or topic would you like to roleplay?
              </label>
              <input
                type="text"
                placeholder="e.g., Ordering coffee at a busy Parisian café..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-xl border border-indigo-200/80 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-3 focus:ring-indigo-500/15 focus:outline-hidden"
              />
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400">
                  Or tap a quick scenario:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TOPICS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => setTopic(suggestion)}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                        topic === suggestion
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-200/90 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 2. DIFFICULTY LEVEL CARD */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <BarChart3 className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  2. Select Fluency &amp; Speed Level
                </h2>
                <p className="text-xs text-slate-500">
                  Adjusts vocabulary complexity, speaking speed, and AI support
                </p>
              </div>
            </div>
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700 uppercase sm:inline-block">
              Step 2 of 2
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LEVELS.map((l) => {
              const isSelected = level === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(l.id)}
                  className={`flex flex-col justify-between rounded-2xl border-2 p-4 text-left transition-all ${
                    isSelected
                      ? l.activeClass
                      : "border-slate-100 bg-slate-50/50 text-slate-800 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase ${l.badgeClass}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${l.dotClass}`}
                        />
                        {l.badge}
                      </span>
                      {isSelected && <CheckCircle2 className="h-4 w-4" />}
                    </div>

                    <h3 className="mt-2.5 text-base font-black">{l.label}</h3>
                  </div>

                  <p className="mt-1 text-xs leading-snug text-slate-500">
                    {l.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN: AI PARTNER & LAUNCHPAD (4 COLS) */}
      <div className="flex flex-col gap-6 lg:col-span-4">
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-indigo-950/15 sm:p-7">
          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-[10px] font-extrabold tracking-wider text-indigo-200 uppercase">
                <Sparkles className="h-3 w-3 text-indigo-300" /> AI Partner Setup
              </span>
              <span className="text-xs font-bold text-emerald-400">
                ● Online
              </span>
            </div>

            {/* Partner Avatar & Voice Toggle */}
            <div className="mt-5 flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-indigo-400/50 bg-slate-900 p-1">
                <img
                  src={previewAvatarUrl}
                  alt="AI Partner"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {voiceGender === "female" ? "Camille (AI)" : "Laurent (AI)"}
                </h3>
                <p className="text-xs text-slate-400">
                  {targetLangObj.flag} {targetLangObj.label} Conversation Partner
                </p>
              </div>
            </div>

            {/* Voice Gender Selector */}
            <div className="mt-5 space-y-2">
              <label className="flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-slate-400 uppercase">
                <Volume2 className="h-3.5 w-3.5 text-indigo-400" /> Tutor Voice
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(["female", "male"] as const).map((gender) => {
                  const active = voiceGender === gender;
                  return (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => setVoiceGender(gender)}
                      className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-extrabold capitalize transition-all ${
                        active
                          ? "border-indigo-400 bg-indigo-500/25 text-white shadow-sm"
                          : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <span>{gender === "female" ? "👩" : "👨"}</span>
                      <span>{gender} Voice</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Pair Selectors */}
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                  <Globe2 className="h-3 w-3 text-slate-400" /> I Speak
                </label>
                <select
                  value={nativeLang}
                  onChange={(e) => setNativeLang(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-white focus:border-indigo-400 focus:outline-hidden"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.code}
                      className="bg-slate-900 text-white"
                    >
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1 text-[10px] font-extrabold tracking-wider text-indigo-300 uppercase">
                  <Globe2 className="h-3 w-3 text-indigo-400" /> Practicing
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full cursor-pointer rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-3 py-2.5 text-xs font-bold text-white focus:border-indigo-400 focus:outline-hidden"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option
                      key={lang.code}
                      value={lang.code}
                      className="bg-slate-900 text-white"
                    >
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Match Summary Box */}
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.05] p-3.5 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Selected Mode</span>
                <span className="font-bold text-white">
                  {selectedModeObj.icon} {selectedModeObj.label}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 py-1">
                <span className="text-slate-400">Difficulty</span>
                <span className="font-bold text-emerald-300">
                  {selectedLevelObj.label} ({selectedLevelObj.badge})
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 py-1">
                <span className="text-slate-400">Session Length</span>
                <span className="font-bold text-white">5 Minutes</span>
              </div>
            </div>

            {/* Primary Launch CTA */}
            <button
              type="button"
              onClick={handleStart}
              disabled={isStarting || (mode === "SPECIFIC" && !topic.trim())}
              className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 py-4 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-all hover:from-indigo-400 hover:to-fuchsia-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Connecting AI Partner...</span>
                </>
              ) : (
                <>
                  <Mic className="h-5 w-5" />
                  <span>Start Live Conversation</span>
                  <Play className="h-4 w-4 fill-current" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}