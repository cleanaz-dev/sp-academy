"use client";

import { Volume2, Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export type TtsStatus = "idle" | "thinking" | "loading" | "playing";

interface BossFoundationFreestyleChatBubbleProps {
  message: any;
  onReplay?: (text: string) => void | Promise<void>;
  aiAvatarUrl?: string;
  ttsStatus?: TtsStatus;
  isBusy?: boolean;
}

export function BossFoundationFreestyleChatBubble({
  message,
  onReplay,
  aiAvatarUrl,
  ttsStatus = "idle",
  isBusy = false,
}: BossFoundationFreestyleChatBubbleProps) {
  // Get the user from Better-Auth
  const { data: session } = authClient.useSession();
  const user = session?.user;

  // ---------------------------------------------------------------------------
  // USER MESSAGE
  // ---------------------------------------------------------------------------
  if (message.role === "user") {
    const initial =
      user?.name?.[0] ??
      (user as any)?.firstName?.[0] ??
      (user as any)?.username?.[0] ??
      "U";

    // Better-Auth stores avatar in `user.image` (with fallback to `imageUrl`)
    const avatarUrl = user?.image ?? (user as any)?.imageUrl;

    return (
      <div className="flex items-end justify-end gap-3 animate-in slide-in-from-bottom-1">
        <div className="flex max-w-[80%] flex-col items-end">
          <div className="rounded-3xl rounded-br-sm bg-blue-500 p-4 text-[15px] leading-relaxed text-white shadow-xs">
            {message.text}
          </div>

          {message.isAnalyzingPronunciation && (
            <span className="mt-1.5 animate-pulse text-xs text-gray-400">
              Scoring pronunciation...
            </span>
          )}

          {message.pronunciationScore && (
            <div className="mt-1.5 flex items-center gap-2 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
              <span>Accuracy: {message.pronunciationScore.accuracyScore}</span>
              <span className="text-gray-300">|</span>
              <span>Fluency: {message.pronunciationScore.fluencyScore}</span>
              <span className="text-gray-300">|</span>
              <span className="text-indigo-600">
                Overall: {message.pronunciationScore.score}
              </span>
            </div>
          )}
        </div>

        <Avatar className="h-9 w-9 shrink-0 border border-slate-700">
          <AvatarImage src={avatarUrl} alt="You" />
          <AvatarFallback className="bg-blue-500 text-sm font-bold uppercase text-white">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ASSISTANT (BOSS) MESSAGE
  // ---------------------------------------------------------------------------
  const isThinking = ttsStatus === "thinking";
  const isLoading = ttsStatus === "loading";
  const isPlayingNow = ttsStatus === "playing";
  const isActive = isLoading || isPlayingNow;

  return (
    <div className="flex items-end gap-3 animate-in slide-in-from-bottom-1">
      <Avatar className="h-9 w-9 shrink-0 border border-slate-700 bg-slate-800">
        <AvatarImage src={aiAvatarUrl} alt="Boss" />
        <AvatarFallback className="bg-indigo-600 text-xs font-bold text-white">
          AI
        </AvatarFallback>
      </Avatar>

      <div className="flex max-w-[80%] flex-col items-start gap-1">
        {/* WHITE BUBBLE: wraps text + audio button */}
        <div className="rounded-3xl rounded-bl-sm border border-gray-100 bg-white px-4 py-3.5 shadow-xs">
          {isThinking ? (
            <div className="flex items-center gap-2.5 text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              <span className="text-sm font-medium">Thinking...</span>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              {/* Text */}
              <div className="text-[15px] leading-relaxed text-gray-900">
                <p>{message.text}</p>
              </div>

              {/* Replay button (only shown if onReplay is passed) */}
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

        {/* TRANSLATION */}
        {!isThinking && message.translation && (
          <p className="mt-0.5 px-2 text-sm italic leading-relaxed text-slate-400">
            {message.translation}
          </p>
        )}
      </div>
    </div>
  );
}