// components/foundation/boss/boss-foundation-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BossFoundationProvider, resolveAssetUrl } from "@/context/boss-context";
import BossFoundationFreestyle from "./boss-foundation-freestyle";
import { BossData } from "@/app/(dashboard)/foundation/actions/get-boss-data";
import { BossScenarioData } from "@/lib/boss/schemas"; // <-- Import your Zod type
import { ShieldAlert, Play, Target } from "lucide-react";

export default function BossFoundationClient({
  session,
}: {
  session: NonNullable<BossData>;
}) {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);

  const handleEnd = () => router.push("/learning-hub"); // Change to your destination

  // Fix: Cast the Prisma JSON to our strongly-typed Zod schema
  const scenarioData = (session.scenarioData as unknown) as BossScenarioData | null;
  
  const boss = scenarioData?.boss || null;
  const totalExercises = scenarioData?.exerciseBank?.length || 0;

  const bossAvatar = boss?.avatarKey
    ? resolveAssetUrl(boss.avatarKey)
    : "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=boss"; // Fallback premium avatar

  if (!hasStarted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 animate-in fade-in duration-700 animate-bg">

        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-indigo-900/10 border border-slate-100 text-center relative overflow-hidden">
          {/* Decorative Background Blob */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-50 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl mb-6 bg-slate-100">
              <img
                src={bossAvatar}
                alt={boss?.name || "Boss"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Boss Info */}
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
              {boss?.name || "Milestone Boss"}
            </h1>
            <p className="text-slate-500 text-sm font-medium px-4 mb-6 leading-relaxed">
              {boss?.persona || "Prove your language skills in this final test."}
            </p>

            {/* Stats */}
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

            {/* Start Button */}
            <button
              onClick={() => setHasStarted(true)}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-lg transition-all active:translate-y-1 active:border-b-0 border-b-4 border-indigo-800 shadow-sm flex items-center justify-center gap-2"
            >
              <Play fill="currentColor" size={20} />
              Start Encounter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BossFoundationProvider session={session} onEnd={handleEnd}>
      <BossFoundationFreestyle onEnd={handleEnd} />
    </BossFoundationProvider>
  );
}