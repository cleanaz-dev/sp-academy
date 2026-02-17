import React from "react";
import { cn } from "@/lib/utils";
import { capitalizeFirstLetter } from "./utils";
import { ImprovementTooltip } from "./improvement-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdRecordVoiceOver } from "react-icons/md";
import type { Message, VoiceGender } from "./types";
import { InlineAudioButton } from "./inline-audio-button";
import { SpellCheck2, Loader2 } from "lucide-react";

interface Props {
  message: Message;
  voiceGender: VoiceGender;
  aiAvatarMaleUrl: string;
  aiAvatarFemaleUrl: string;
  userAvatarUrl?: string;
  speakPhrase: (text: string) => void;
  audioBase64Map: Record<string, string>;
  createAudioUrl: (base64: string) => string;
}

export const MessageBubble: React.FC<Props> = ({
  message,
  voiceGender,
  aiAvatarMaleUrl,
  aiAvatarFemaleUrl,
  userAvatarUrl,
  speakPhrase,
  audioBase64Map,
  createAudioUrl,
}) => {
  const isUser = message.role === "user";
  const showAIAvatar = !isUser && voiceGender === "female";
  const showMaleAvatar = !isUser && voiceGender === "male";

  const messageId =
    message.id || `${message.role}-${message.timestamp || Date.now()}`;
  const audioBase64 = audioBase64Map?.[messageId];

  const hasTranslation = !!message.translation;
  const hasGrammarScore = !!message.label || !!message.score;
  const isTranslating = isUser && !hasTranslation;
  const isGrading = isUser && !hasGrammarScore;

  return (
    <div
      className={cn(
        "mb-4 flex items-end",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {/* AI AVATARS */}
      {showAIAvatar && (
        <Avatar className="mr-3 h-10 w-10 transform drop-shadow-md">
          <AvatarImage src={aiAvatarFemaleUrl} />
          <AvatarFallback className="bg-blue-500 text-white">AI</AvatarFallback>
        </Avatar>
      )}

      {showMaleAvatar && (
        <Avatar className="mr-3 h-10 w-10 transform drop-shadow-md">
          <AvatarImage src={aiAvatarMaleUrl} />
          <AvatarFallback className="bg-gray-500 text-white">U</AvatarFallback>
        </Avatar>
      )}

      {/* BUBBLE CONTENT */}
      <div
        className={cn(
          "relative rounded-2xl px-4 py-3 text-sm shadow-md md:max-w-[75%]",
          isUser
            ? "min-w-44 self-end rounded-br-none bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
            : "self-start rounded-bl-none bg-white text-gray-900",
        )}
      >
        {/* TYPING INDICATOR */}
        {message.isTyping ? (
          <span className="flex items-end gap-[3px] py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1 rounded-full bg-gray-400 md:size-1.5"
                style={{
                  animation: "typingBounce 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </span>
        ) : (
          <>
            <p className="font-medium">
              {capitalizeFirstLetter(message.content)}
            </p>

            {/* Translation or Loading Spinner */}
            {isTranslating ? (
              <div className="mt-1 flex items-center gap-2 opacity-80">
                <Loader2 className="h-3 w-3 animate-spin" />
                <p className="text-xs italic">Translating...</p>
              </div>
            ) : (
              message.translation && (
                <p className="mt-1 text-xs italic opacity-80">
                  {message.translation}
                </p>
              )
            )}

            {/* AI Audio Button */}
            {!isUser && audioBase64 && (
              <InlineAudioButton
                audioBase64={audioBase64}
                createAudioUrl={createAudioUrl}
                size="small"
              />
            )}

            {/* USER FOOTER (Scores) */}
            {isUser && (
              <div
                className={cn(
                  "-mx-4 -mb-3 mt-2 px-4 pb-3 pt-2",
                  "rounded-b-2xl border-t border-gray-100 bg-gray-50",
                  isUser ? "rounded-br-none" : "rounded-bl-none",
                )}
              >
                <div className="flex min-h-[24px] items-center justify-between">
                  <div className="flex items-center gap-4">
                    {message.pronunciationScore && (
                      <div
                        className={cn(
                          "flex items-center gap-2 text-xs font-bold",
                          message.pronunciationScore.score >= 90
                            ? "text-emerald-500"
                            : message.pronunciationScore.score >= 80
                              ? "text-green-600"
                              : message.pronunciationScore.score >= 70
                                ? "text-amber-500"
                                : "text-red-400",
                        )}
                      >
                        <MdRecordVoiceOver className="size-4" />
                        <p>{message.pronunciationScore.score}</p>
                      </div>
                    )}

                    {isGrading ? (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                        <span>Checking grammar...</span>
                      </div>
                    ) : message.label ? (
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs font-bold",
                          message.label === "Excellent" || message.label === "Great"
                            ? "text-emerald-500"
                            : message.label === "Good"
                              ? "text-green-600"
                              : message.label === "OK"
                                ? "text-amber-500"
                                : "text-red-400",
                        )}
                      >
                        <SpellCheck2 className="size-4" /> {message.label}!
                      </span>
                    ) : null}
                  </div>

                  {!isGrading && message.improvedResponse && (
                    <ImprovementTooltip
                      improvedResponse={message.improvedResponse}
                      originalText={message.content}
                      corrections={message.corrections}
                      speakPhrase={speakPhrase}
                      pronunciationScore={message.pronunciationScore}
                    />
                  )}
                </div>
              </div>
            )}

            {isUser && isGrading && (
              <span className="absolute -bottom-1 right-2 h-2 w-2 animate-ping rounded-full bg-blue-400"></span>
            )}
          </>
        )}
      </div>

      {isUser && (
        <Avatar className="ml-3 h-10 w-10 drop-shadow-md">
          {userAvatarUrl && <AvatarImage src={userAvatarUrl} />}
          <AvatarFallback className="bg-gray-500 text-white">U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};