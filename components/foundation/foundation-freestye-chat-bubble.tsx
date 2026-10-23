// foundation-freestye-chat-bubble.tsx
"use client";

import { Volume2, Loader2, Sparkles, Flame, Zap, Target } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export type TtsStatus = "idle" | "thinking" | "loading" | "playing";

interface FreestyleChatBubbleProps {
  message: any;
  onReplay?: (text: string) => void | Promise<void>;
  aiAvatarUrl?: string;
  ttsStatus?: TtsStatus;
  isBusy?: boolean;
}

function getScoreTier(score: number) {
  if (score >= 90) {
    return {
      label: "Native Flow",
      Icon: Flame,
      pillClass:
        "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-950",
      scoreClass: "text-emerald-400",
      barClass: "bg-emerald-400",
    };
  }
  if (score >= 75) {
    return {
      label: "Solid Delivery",
      Icon: Zap,
      pillClass:
        "bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-sm shadow-indigo-950",
      scoreClass: "text-indigo-400",
      barClass: "bg-indigo-400",
    };
  }
  return {
    label: "Keep Sharpening",
    Icon: Target,
    pillClass:
      "bg-amber-500/15 border-amber-500/40 text-amber-300 shadow-sm shadow-amber-950",
    scoreClass: "text-amber-400",
    barClass: "bg-amber-400",
  };
}

export function FoundationFreestyleChatBubble({
  message,
  onReplay,
  aiAvatarUrl,
  ttsStatus = "idle",
  isBusy = false,
}: FreestyleChatBubbleProps) {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  // ============================================================================
  // USER MESSAGE (With Gamified Azure Pronunciation HUD + Word Highlighting)
  // ============================================================================
  if (message.role === "user") {
    const initial =
      user?.name?.[0] ??
      (user as any)?.firstName?.[0] ??
      (user as any)?.username?.[0] ??
      "U";

    const avatarUrl = user?.image ?? (user as any)?.imageUrl;

    const pron = message.pronunciationScore;
    const overallScore =
      pron?.score ?? pron?.pronScore ?? pron?.accuracyScore ?? null;
    const accuracyScore = pron?.accuracyScore ?? overallScore;
    const fluencyScore = pron?.fluencyScore ?? overallScore;
    const wordScores: Array<{ word: string; accuracyScore: number }> =
      pron?.words ?? [];

    const tier = overallScore != null ? getScoreTier(overallScore) : null;

    return (
      <div className="flex items-end justify-end gap-3 animate-in slide-in-from-bottom-2 duration-300">
        <div className="flex max-w-[82%] flex-col items-end">
          {/* Speech Bubble (Word-by-Word colored if Azure words available) */}
          <div className="px-5 py-3.5 rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-sm shadow-md text-[15px] leading-relaxed font-medium">
            {wordScores.length > 0 ? (
              <div className="flex flex-wrap gap-x-1.5 gap-y-1">
                {wordScores.map((w, idx) => {
                  const s = w.accuracyScore ?? 100;
                  const wordColor =
                    s >= 85
                      ? "underline decoration-emerald-300/80 decoration-2 underline-offset-4"
                      : s >= 65
                        ? "underline decoration-amber-300/80 decoration-2 underline-offset-4"
                        : "underline decoration-rose-300 decoration-wavy decoration-2 underline-offset-4 text-rose-100";

                  return (
                    <span
                      key={idx}
                      title={`${w.word}: ${s}% accuracy`}
                      className={`cursor-help transition-transform hover:scale-105 ${wordColor}`}
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>
            ) : (
              message.text
            )}
          </div>

          {/* Analyzing Shimmer */}
          {message.isAnalyzingPronunciation && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-3 py-1 text-[11px] font-bold text-slate-300 animate-pulse">
              <Sparkles className="h-3 w-3 text-indigo-400 animate-spin" />
              <span>Grading pronunciation...</span>
            </div>
          )}

          {/* GAMIFIED PRONUNCIATION SCORECARD */}
          {overallScore != null && tier && (
            <div
              className={`mt-2 flex flex-wrap items-center gap-3 rounded-2xl border px-3.5 py-2 text-xs backdrop-blur-md animate-in zoom-in-95 duration-300 ${tier.pillClass}`}
            >
              {/* Overall Score + Tier Label */}
              <div className="flex items-center gap-1.5 pr-2 border-r border-white/10">
                <tier.Icon className={`h-4 w-4 ${tier.scoreClass}`} />
                <span className={`text-sm font-black ${tier.scoreClass}`}>
                  {overallScore}%
                </span>
                <span className="font-extrabold tracking-wide uppercase text-[10px] opacity-90">
                  {tier.label}
                </span>
              </div>

              {/* Mini Accuracy Meter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Acc
                </span>
                <div className="h-1.5 w-10 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${tier.barClass}`}
                    style={{ width: `${Math.min(100, accuracyScore)}%` }}
                  />
                </div>
                <span className="font-bold text-slate-200">
                  {accuracyScore}%
                </span>
              </div>

              {/* Mini Fluency Meter */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Flow
                </span>
                <div className="h-1.5 w-10 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${tier.barClass}`}
                    style={{ width: `${Math.min(100, fluencyScore)}%` }}
                  />
                </div>
                <span className="font-bold text-slate-200">
                  {fluencyScore}%
                </span>
              </div>
            </div>
          )}
        </div>

        <Avatar className="h-9 w-9 shrink-0 border border-slate-700">
          <AvatarImage src={avatarUrl} alt="You" />
          <AvatarFallback className="bg-blue-500 text-white text-sm font-bold uppercase">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  // ============================================================================
  // ASSISTANT MESSAGE
  // ============================================================================
  const isThinking = ttsStatus === "thinking";
  const isLoading = ttsStatus === "loading";
  const isPlayingNow = ttsStatus === "playing";
  const isActive = isLoading || isPlayingNow;

  return (
    <div className="flex items-end gap-3 animate-in slide-in-from-bottom-2 duration-300">
      <Avatar className="h-9 w-9 shrink-0 border border-slate-700 bg-slate-800">
        <AvatarImage src={aiAvatarUrl} alt="AI Tutor" />
        <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
          AI
        </AvatarFallback>
      </Avatar>

      <div className="flex max-w-[80%] flex-col items-start gap-1">
        <div className="rounded-3xl rounded-bl-sm border border-gray-100 bg-white px-4 py-3.5 shadow-xs">
          {isThinking ? (
            <div className="flex items-center gap-2.5 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              <span className="text-sm font-medium">Speaking...</span>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="text-[15px] leading-relaxed text-gray-900 font-medium">
                <p>{message.text}</p>
              </div>

              {onReplay && (
                <button
                  onClick={() => onReplay(message.text)}
                  disabled={isBusy}
                  aria-label="Replay message"
                  className={`-ml-2 flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors active:scale-95 disabled:cursor-not-allowed ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-40"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Volume2
                      className={`h-3.5 w-3.5 ${isPlayingNow ? "animate-pulse" : ""}`}
                    />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {!isThinking && message.translation && (
          <p className="mt-0.5 px-2 text-sm italic leading-relaxed text-slate-400">
            {message.translation}
          </p>
        )}
      </div>
    </div>
  );
}