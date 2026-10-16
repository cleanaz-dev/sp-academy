// components/foundation/boss/boss-foundation-client.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BossFoundationProvider } from "@/context/boss-context";
import BossFoundationFreestyle from "./boss-foundation-freestyle";
import { BossData } from "@/app/(dashboard)/foundation/actions/get-boss-data";
import { BossScenarioData } from "@/lib/boss/schemas";
import { ShieldAlert, Play, Target, Loader2 } from "lucide-react";
import { useS3Media } from "@/context/s3-context"; 
import { WordAudioProvider } from "@/context/word-audio-context";

// ADD THIS: Map the DB enums to browser TTS codes!
const LANGUAGE_MAP: Record<string, string> = {
  FRENCH: "fr-FR",
  SPANISH: "es-ES",
  GERMAN: "de-DE",
  ITALIAN: "it-IT",
  ENGLISH: "en-US"
};

export default function BossFoundationClient({
  session,
}: {
  session: NonNullable<BossData>;
}) {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);

  const handleEnd = () => router.push("/learning-hub");

  const scenarioData =
    session.scenarioData as unknown as BossScenarioData | null;
  const boss = scenarioData?.boss || null;
  const playlist = scenarioData?.exerciseBank || [];
  const totalExercises = playlist.length || 0;

  // Safely grab the target language and map it to fr-FR
  const rawLang = session?.course?.targetLanguage || (session as any)?.targetLanguage || "fr-FR";
  const bcp47Lang = LANGUAGE_MAP[rawLang] || rawLang;

  const allKeys = useMemo(() => {
    const keys: (string | undefined)[] = [boss?.avatarKey ?? undefined];
    playlist.forEach((item) => {
      keys.push(item.audioKey ?? undefined); 
      if (item.imageOptions) {
        item.imageOptions.forEach((opt) =>
          keys.push(opt.imageKey ?? undefined),
        ); 
      }
    });
    return keys;
  }, [boss, playlist]);

  const { urls, isLoading } = useS3Media(allKeys);

  const resolvedAvatarUrl = urls[0];
  const bossAvatar =
    resolvedAvatarUrl ||
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=boss";

  return (
    <div className="min-h-screen w-full animate-bg p-4">
      {!hasStarted ? (
        <div className="flex min-h-[calc(100vh-2rem)] flex-col items-center justify-center p-2">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-2xl shadow-indigo-900/10">
            <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-indigo-50 blur-3xl" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow-xl">
                {isLoading && !resolvedAvatarUrl ? (
                  <Loader2 className="animate-spin text-indigo-300" size={32} />
                ) : (
                  <img
                    src={bossAvatar}
                    alt={boss?.name || "Boss"}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <h1 className="mb-2 text-3xl font-extrabold text-slate-900">
                {boss?.name || "Milestone Boss"}
              </h1>

              <p className="mb-6 px-4 text-sm font-medium leading-relaxed text-slate-500">
                {boss?.persona ||
                  "Prove your language skills in this final test."}
              </p>

              <div className="mb-8 flex w-full items-center justify-center gap-6">
                <div className="flex w-1/2 flex-col items-center gap-1 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <Target className="text-indigo-500" size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Challenges
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {totalExercises}
                  </span>
                </div>

                <div className="flex w-1/2 flex-col items-center gap-1 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <ShieldAlert className="text-rose-500" size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Lives
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    3 Hearts
                  </span>
                </div>
              </div>

              <button
                onClick={() => setHasStarted(true)}
                disabled={isLoading}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-extrabold text-white shadow-sm transition-all ${
                  isLoading
                    ? "cursor-not-allowed border-indigo-500 bg-indigo-400 opacity-80"
                    : "border-b-4 border-indigo-800 bg-indigo-600 hover:bg-indigo-500 active:translate-y-1 active:border-b-0"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Play fill="currentColor" size={20} />
                )}
                {isLoading ? "Loading Media..." : "Start Encounter"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <BossFoundationProvider
          session={session}
          onEnd={handleEnd}
          preloadedKeys={allKeys}
          preloadedUrls={urls}
        >
          {/* PASSED THE CORRECT LANGUAGE CODE HERE! */}
          <WordAudioProvider targetLang={bcp47Lang}>
            <BossFoundationFreestyle onEnd={handleEnd} />
          </WordAudioProvider>
        </BossFoundationProvider>
      )}
    </div>
  );
}