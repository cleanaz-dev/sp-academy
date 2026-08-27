"use client";

import { Volume2 } from "lucide-react";

interface FreestyleChatBubbleProps {
  message: any;
  onReplay?: (text: string) => void;
}

export function FreestyleChatBubble({
  message,
  onReplay,
}: FreestyleChatBubbleProps) {
  // User message
  if (message.role === "user") {
    return (
      <div className="flex flex-col items-end animate-in slide-in-from-bottom-1">
        <div className="max-w-[85%] p-4 rounded-3xl bg-blue-500 text-white rounded-br-sm shadow-sm text-[15px] leading-relaxed">
          {message.text}
        </div>

        {message.isAnalyzingPronunciation && (
          <span className="text-xs text-gray-400 mt-1.5 animate-pulse">
            Scoring pronunciation...
          </span>
        )}

        {message.pronunciationScore && (
          <div className="mt-1.5 flex items-center gap-2 text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            <span>
              Accuracy: {message.pronunciationScore.accuracyScore}
            </span>
            <span className="text-gray-300">|</span>
            <span>
              Fluency: {message.pronunciationScore.fluencyScore}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-indigo-600">
              Overall: {message.pronunciationScore.score}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex flex-col items-start gap-1 animate-in slide-in-from-bottom-1">
      <div className="max-w-[85%] p-4 rounded-3xl bg-white border border-gray-100 text-gray-900 rounded-bl-sm shadow-sm text-[15px] leading-relaxed">
        <p>{message.text}</p>

        {message.translation && (
          <p className="mt-2 text-sm text-gray-500 italic border-t border-gray-50 pt-2">
            {message.translation}
          </p>
        )}
      </div>

      {onReplay && (
        <button
          onClick={() => onReplay(message.text)}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-500 hover:text-indigo-700 transition-colors px-3 py-1.5 rounded-full hover:bg-indigo-50 active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5" />
          Replay
        </button>
      )}
    </div>
  );
}