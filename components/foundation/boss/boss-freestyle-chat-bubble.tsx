// components/foundation/boss/boss-freestyle-chat-bubble.tsx
"use client";

import { Volume2, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { BossMessage } from "@/context/boss-context";

export type TtsStatus = "idle" | "thinking" | "loading" | "playing";

interface BossFoundationFreestyleChatBubbleProps {
  message: BossMessage;
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
  // Never render raw user message bubbles in the boss stage
  if (message.role === "user" || (message as any).sender === "user") {
    return null;
  }

  const isThinking = ttsStatus === "thinking";
  const isLoading = ttsStatus === "loading";
  const isPlayingNow = ttsStatus === "playing";
  const isActive = isLoading || isPlayingNow;

  const isCorrectReaction = message.status === "correct";
  const isIncorrectReaction = message.status === "incorrect";
  const isGradedReaction = isCorrectReaction || isIncorrectReaction;

  return (
    <div className="flex items-end gap-3.5 animate-in slide-in-from-bottom-2 duration-300">
      <Avatar
        className={`h-12 w-12 shrink-0 border-2 shadow-md transition-all ${
          isCorrectReaction
            ? "border-emerald-400 bg-emerald-50"
            : isIncorrectReaction
              ? "border-rose-400 bg-rose-50"
              : "border-slate-300 bg-slate-800"
        }`}
      >
        <AvatarImage
          src={aiAvatarUrl}
          alt="Boss"
          className="object-cover"
        />
        <AvatarFallback className="bg-indigo-600 text-xs font-bold text-white">
          BOSS
        </AvatarFallback>
      </Avatar>

      <div className="flex max-w-[82%] flex-col items-start gap-1">
        <div
          className={`rounded-3xl rounded-bl-sm border-2 px-5 py-3.5 shadow-sm transition-all ${
            isCorrectReaction
              ? "border-emerald-200 bg-emerald-50/90 text-emerald-950"
              : isIncorrectReaction
                ? "border-rose-200 bg-rose-50/90 text-rose-950"
                : "border-slate-200 bg-white text-slate-900"
          }`}
        >
          {isGradedReaction && (
            <div className="mb-1.5 flex items-center gap-1.5">
              {isCorrectReaction ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
                    Correct! +50 XP
                  </span>
                </>
              ) : (
                <>
                  <XCircle size={15} className="text-rose-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">
                    Incorrect • -1 Heart
                  </span>
                </>
              )}
            </div>
          )}

          {isThinking ? (
            <div className="flex items-center gap-2.5 text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
              <span className="text-sm font-medium">Thinking...</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-[15px] font-bold leading-relaxed">
                <p>{message.text}</p>
              </div>

              {onReplay && message.text && (
                <button
                  type="button"
                  onClick={() => onReplay(message.text!)}
                  disabled={isBusy}
                  aria-label="Replay message"
                  className={`flex shrink-0 items-center justify-center rounded-full p-2 transition-colors active:scale-95 disabled:cursor-not-allowed ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-indigo-500 hover:bg-indigo-100/70 hover:text-indigo-700 disabled:opacity-40"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2
                      className={`h-4 w-4 ${isPlayingNow ? "animate-pulse" : ""}`}
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