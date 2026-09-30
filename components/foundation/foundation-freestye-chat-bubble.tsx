"use client";

import { useState } from "react";
import { Volume2, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface FreestyleChatBubbleProps {
  message: any;
  onReplay?: (text: string) => void | Promise<void>;
  aiAvatarUrl?: string;
  isPlaying?: boolean;
  isSpeechLoading?: boolean;
}

export function FoundationFreestyleChatBubble({
  message,
  onReplay,
  aiAvatarUrl,
  isPlaying = false,
  isSpeechLoading = false,
}: FreestyleChatBubbleProps) {
  const { user } = useUser();

  // Hooks must run before any early return
  const [isThisReplaying, setIsThisReplaying] = useState(false);

  const isBusy = isPlaying || isSpeechLoading;
  const showLoading = isThisReplaying && isSpeechLoading;
  const showPlaying = isThisReplaying && isPlaying && !isSpeechLoading;

  const handleReplayClick = async () => {
    if (!onReplay || isBusy) return;
    setIsThisReplaying(true);
    try {
      await onReplay(message.text);
    } finally {
      setIsThisReplaying(false);
    }
  };

  // User message
  if (message.role === "user") {
    const initial = user?.firstName?.[0] ?? user?.username?.[0] ?? "U";

    return (
      <div className="flex items-end justify-end gap-3 animate-in slide-in-from-bottom-1">
        <div className="flex max-w-[80%] flex-col items-end">
          <div className="p-4 rounded-3xl bg-blue-500 text-white rounded-br-sm shadow-xs text-[15px] leading-relaxed">
            {message.text}
          </div>

          {message.isAnalyzingPronunciation && (
            <span className="text-xs text-gray-400 mt-1.5 animate-pulse">
              Scoring pronunciation...
            </span>
          )}

          {message.pronunciationScore && (
            <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
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
          <AvatarImage src={user?.imageUrl} alt="You" />
          <AvatarFallback className="bg-blue-500 text-white text-sm font-bold uppercase">
            {initial}
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex items-end gap-3 animate-in slide-in-from-bottom-1">
      <Avatar className="h-9 w-9 shrink-0 border border-slate-700 bg-slate-800">
        <AvatarImage src={aiAvatarUrl} alt="AI Tutor" />
        <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
          AI
        </AvatarFallback>
      </Avatar>

      <div className="flex max-w-[80%] flex-col items-start gap-1">
        <div className="p-4 rounded-3xl bg-white border border-gray-100 text-gray-900 rounded-bl-sm shadow-xs text-[15px] leading-relaxed">
          <p>{message.text}</p>

          {message.translation && (
            <p className="mt-2 text-sm text-secondary italic border-t border-transparent pt-2">
              {message.translation}
            </p>
          )}
        </div>

        {onReplay && (
          <button
            onClick={handleReplayClick}
            disabled={isBusy}
            aria-label="Replay message"
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors active:scale-95 disabled:cursor-not-allowed
              ${
                isThisReplaying
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 disabled:opacity-40"
              }`}
          >
            {showLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Volume2
                className={`w-3.5 h-3.5 ${showPlaying ? "animate-pulse" : ""}`}
              />
            )}
            {showLoading ? "Loading..." : showPlaying ? "Playing..." : "Replay"}
          </button>
        )}
      </div>
    </div>
  );
}