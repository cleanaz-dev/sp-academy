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

const FALLBACK_AVATAR =
  "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=boss";

// Helper: if a DB record has coverUrl ("boss/covers/m1_madame_chastain/cover.png")
// but is missing boss.avatar, derive the 4 S3 avatar keys automatically
function getBossAvatarKeys(boss: BossScenarioData["boss"] | null) {
  const derivedPrefix = boss?.coverUrl
    ? boss.coverUrl
        .replace(/^boss\/covers\//, "boss/avatars/")
        .replace(/\/cover\.png$/, "")
    : null;

  return {
    default:
      boss?.avatar?.default ??
      boss?.avatarKey ??
      (derivedPrefix ? `${derivedPrefix}/default.png` : undefined),
    happy:
      boss?.avatar?.happy ??
      (derivedPrefix ? `${derivedPrefix}/happy.png` : undefined),
    sad:
      boss?.avatar?.sad ??
      (derivedPrefix ? `${derivedPrefix}/sad.png` : undefined),
    angry:
      boss?.avatar?.angry ??
      (derivedPrefix ? `${derivedPrefix}/angry.png` : undefined),
  };
}

export default function BossFoundationClient({
  session,
}: {
  session: NonNullable<BossData>;
}) {
  const router = useRouter();
  const [hasStarted, setHasStarted] = useState(false);

  const handleEnd = () => router.push("/learning-hub");
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

  const avatarKeys = useMemo(() => getBossAvatarKeys(boss), [boss]);

  // Index 0 = default avatar, Index 1 = coverUrl, Index 2..4 = happy, sad, angry
  const allKeys = useMemo(() => {
    const keys: (string | undefined)[] = [
      avatarKeys.default,
      boss?.coverUrl ?? undefined,
      avatarKeys.happy,
      avatarKeys.sad,
      avatarKeys.angry,
    ];
    playlist.forEach((item) => {
      keys.push(item.audioKey ?? undefined);
      if (item.imageOptions) {
        item.imageOptions.forEach((opt) =>
          keys.push(opt.imageKey ?? undefined),
        );
      }
    });
    return keys;
  }, [boss, avatarKeys, playlist]);

  const { urls, isLoading } = useS3Media(allKeys);

  const resolvedDefaultAvatarUrl = urls[0];
  const resolvedCoverUrl = urls[1];
  const bossAvatar = resolvedDefaultAvatarUrl || FALLBACK_AVATAR;

  return (
    <div className="min-h-screen w-full animate-bg p-4 flex flex-col justify-center">
      {!hasStarted ? (
        <div className="flex w-full flex-col items-center justify-center py-8">
          {/* Main Pre-Boss Card */}
          <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white text-center shadow-2xl shadow-indigo-900/10">
            {/* Widescreen Cover Banner */}
            <div className="relative h-48 w-full bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 sm:h-56">
              {resolvedCoverUrl ? (
                <img
                  src={resolvedCoverUrl}
                  alt={`${boss?.name || "Boss"} scene`}
                  className="h-full w-full object-cover"
                />
              ) : (
                isLoading && (
                  <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="animate-spin text-white/60" size={32} />
                  </div>
                )
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            </div>

            {/* Overlapping Circular Boss Avatar */}
            <div className="relative px-8 pb-8 pt-16">
              <div className="absolute -top-14 left-1/2 flex h-28 w-28 -translate-x-1/2 items-center justify-center overflow-hidden rounded-full border-[6px] border-white bg-slate-100 shadow-xl">
                {isLoading && !resolvedDefaultAvatarUrl ? (
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
                  <span className="text-2xl font-black text-rose-900">3</span>
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
              <BossFoundationFreestyle onEnd={handleEnd} onRetry={handleRetry} />
            </WordAudioProvider>
          </MatrixProvider>
        </BossFoundationProvider>
      )}
    </div>
  );
}