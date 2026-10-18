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
import { MatrixProvider } from "@/context/matrix-context";

export default function BossFoundationClient({
  session,
}: {
  session: NonNullable<BossData>;
}) {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);

  const handleEnd = () => router.push("/learning-hub");
  
  // Create a retry handler that simply sets the state back to the pre-boss screen
  const handleRetry = () => setHasStarted(false);

  const scenarioData =
    session.scenarioData as unknown as BossScenarioData | null;
  const boss = scenarioData?.boss || null;
  const playlist = scenarioData?.exerciseBank || [];
  const totalExercises = playlist.length || 0;

  const rawLang =
    session?.course?.targetLanguage ||
    (session as any)?.targetLanguage ||
    "fr-FR";

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
    <div className="min-h-screen w-full animate-bg p-4 flex flex-col justify-center">
      {!hasStarted ? (
        <div className="flex w-full flex-col items-center justify-center py-12">
          {/* Main Card */}
          <div className="relative mt-16 w-full max-w-lg rounded-[2.5rem] border border-slate-100 bg-white px-8 pb-8 pt-20 text-center shadow-2xl shadow-indigo-900/10">
            
            <div className="absolute -top-16 left-1/2 flex h-32 w-32 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-slate-100 shadow-xl">
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

            <h1 className="mb-4 text-3xl font-black text-slate-800">
              {boss?.name || "Milestone Boss"}
            </h1>

            <div className="mb-8 max-h-40 overflow-y-auto rounded-2xl bg-slate-50 p-5 shadow-inner scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200">
              <p className="text-[15px] font-medium leading-relaxed text-slate-600">
                {boss?.persona ||
                  "Prove your language skills in this final test."}
              </p>
            </div>

            <div className="mb-8 flex w-full gap-4">
              <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-indigo-50 bg-indigo-50/40 py-4 transition-colors hover:bg-indigo-50/80">
                <div className="mb-1 rounded-full bg-indigo-100 p-2 text-indigo-600">
                  <Target size={22} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                  Challenges
                </span>
                <span className="text-2xl font-black text-indigo-900">
                  {totalExercises}
                </span>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-rose-50 bg-rose-50/40 py-4 transition-colors hover:bg-rose-50/80">
                <div className="mb-1 rounded-full bg-rose-100 p-2 text-rose-600">
                  <ShieldAlert size={22} strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">
                  Lives
                </span>
                <span className="text-2xl font-black text-rose-900">
                  3
                </span>
              </div>
            </div>

            <button
              onClick={() => setHasStarted(true)}
              disabled={isLoading}
              className={`group relative flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-lg font-extrabold text-white transition-all ${
                isLoading
                  ? "cursor-not-allowed bg-indigo-300"
                  : "border-b-4 border-indigo-700 bg-indigo-500 shadow-lg shadow-indigo-200 hover:bg-indigo-400 hover:shadow-indigo-300 active:translate-y-1 active:border-b-0"
              }`}
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Play
                  className="transition-transform group-hover:scale-110"
                  fill="currentColor"
                  size={22}
                />
              )}
              <span>{isLoading ? "Loading Media..." : "Start Encounter"}</span>
            </button>
          </div>
        </div>
      ) : (
        <BossFoundationProvider
          session={session}
          onEnd={handleEnd}
          preloadedKeys={allKeys}
          preloadedUrls={urls}
        >
          <MatrixProvider>
            <WordAudioProvider targetLang={rawLang}>
              {/* Pass the onRetry handler down */}
              <BossFoundationFreestyle onEnd={handleEnd} onRetry={handleRetry} />
            </WordAudioProvider>
          </MatrixProvider>
        </BossFoundationProvider>
      )}
    </div>
  );
}