// components/foundation/boss/boss-foundation-client.tsx
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BossFoundationProvider } from "@/context/boss-context";
import BossFoundationFreestyle from "./boss-foundation-freestyle";
import { BossData } from "@/app/(dashboard)/foundation/actions/get-boss-data";
import { BossScenarioData } from "@/lib/boss/schemas";
import { ShieldAlert, Play, Target, Loader2 } from "lucide-react";
import { useS3Media } from "@/context/s3-context"; // <--- Import your S3 Hook

export default function BossFoundationClient({
  session,
}: {
  session: NonNullable<BossData>;
}) {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);

  const handleEnd = () => router.push("/learning-hub"); // Change to your destination

  const scenarioData = (session.scenarioData as unknown) as BossScenarioData | null;
  const boss = scenarioData?.boss || null;
  const playlist = scenarioData?.exerciseBank || [];
  const totalExercises = playlist.length || 0;

  // 1. Gather EVERY media key used in the entire boss encounter
  const allKeys = useMemo(() => {
    // Add ?? undefined to convert nulls
    const keys: (string | undefined)[] = [boss?.avatarKey ?? undefined]; 
    
    playlist.forEach((item) => {
      keys.push(item.audioKey ?? undefined); // Add ?? undefined
      if (item.imageOptions) {
        item.imageOptions.forEach((opt) => keys.push(opt.imageKey ?? undefined)); // Add ?? undefined
      }
    });
    
    return keys;
  }, [boss, playlist]);

  // 2. Pre-fetch them all!
  const { urls, isLoading } = useS3Media(allKeys);

  // Avatar is the very first key we requested (at index 0)
  const resolvedAvatarUrl = urls[0];
  const bossAvatar = resolvedAvatarUrl || "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=boss";

  if (!hasStarted) {
    return (
      <div className="flex min-h-[85vh] flex-col items-center justify-center p-6 animate-in fade-in duration-700">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-indigo-900/10 border border-slate-100 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Boss Avatar */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl mb-6 bg-slate-100 flex items-center justify-center">
              {isLoading && !resolvedAvatarUrl ? (
                <Loader2 className="animate-spin text-indigo-300" size={32} />
              ) : (
                <img src={bossAvatar} alt={boss?.name || "Boss"} className="w-full h-full object-cover" />
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              {boss?.name || "Milestone Boss"}
            </h1>
            <p className="text-slate-500 text-sm font-medium px-4 mb-6 leading-relaxed">
              {boss?.persona || "Prove your language skills in this final test."}
            </p>

            <div className="flex items-center gap-6 mb-8 w-full justify-center">
              <div className="flex flex-col items-center gap-1 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 w-1/2">
                <Target className="text-indigo-500" size={24} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Challenges</span>
                <span className="text-lg font-bold text-slate-800">{totalExercises}</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 w-1/2">
                <ShieldAlert className="text-rose-500" size={24} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lives</span>
                <span className="text-lg font-bold text-slate-800">3 Hearts</span>
              </div>
            </div>

            {/* Block starting until S3 finishes fetching all keys! */}
            <button
              onClick={() => setHasStarted(true)}
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl text-white font-extrabold text-lg transition-all shadow-sm flex items-center justify-center gap-2 ${
                isLoading 
                  ? "bg-indigo-400 border-indigo-500 cursor-not-allowed opacity-80" 
                  : "bg-indigo-600 hover:bg-indigo-500 active:translate-y-1 active:border-b-0 border-b-4 border-indigo-800"
              }`}
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Play fill="currentColor" size={20} />}
              {isLoading ? "Loading Media..." : "Start Encounter"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BossFoundationProvider 
      session={session} 
      onEnd={handleEnd}
      preloadedKeys={allKeys} 
      preloadedUrls={urls}
    >
      <BossFoundationFreestyle onEnd={handleEnd} />
    </BossFoundationProvider>
  );
}