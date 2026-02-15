// improvement-tooltip.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Info,
  Sparkles,
  MessageSquareQuote,
  CircleCheck,
  GraduationCap,
  Book,
  PenTool,
  Volume2,
  Mic2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImprovementTooltipProps, WordScore } from "./types";
import { capitalizeFirstLetter } from "./utils";
import { speakPhrase } from "./utils";

export const ImprovementTooltip: React.FC<ImprovementTooltipProps> = ({
  improvedResponse,
  originalText,
  corrections,
  pronunciationScore,
  speakPhrase: customSpeakPhrase,
}) => {
  const handleSpeak = customSpeakPhrase || speakPhrase;

  // Helper to get color for word scores
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400 bg-green-500/20";
    if (score >= 80) return "text-yellow-400 bg-yellow-500/20";
    if (score >= 70) return "text-orange-400 bg-orange-500/20";
    return "text-red-400 bg-red-500/20";
  };

  // Show pronunciation breakdown if score is low (< 80)
  const showPronunciationBreakdown = 
    pronunciationScore && 
    pronunciationScore.score < 80 && 
    pronunciationScore.words && 
    pronunciationScore.words.length > 0;

  const renderCorrectionCategory = (
    title: string,
    correction: string | { correction: string; reason?: string } | undefined,
    icon: React.ReactNode,
  ) => {
    if (!correction) return null;

    return (
      <div className="mb-3 pl-2">
        <div className="mb-1 flex items-center gap-2 text-sm text-slate-300">
          {icon}
          {title}:
        </div>
        <div className="space-y-1 pl-6">
          <div className="text-white">
            {typeof correction === "object"
              ? correction.correction
              : correction}
          </div>
          {typeof correction === "object" && correction.reason && (
            <div className="text-xs italic text-emerald-400">
              Why: {correction.reason}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex animate-pulse items-center space-x-1 text-blue-500 white shadow-2xl shadow-white transition-transform hover:scale-110">
          <Info className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl rounded-lg border-none bg-gradient-to-r from-indigo-600/70 to-purple-700/70 p-6 text-white shadow-xl backdrop-blur-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-white">
            <Sparkles className="h-6 w-6" />
            <span>Better Way to Say This</span>
          </DialogTitle>
          <DialogDescription>
            <span className="text-xs text-white/50">
              Please review information below
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm text-slate-100">
          {/* Original Phrase */}
          <p className="rounded-lg bg-white/5 p-3">
            <span className="mb-2 flex items-center gap-2 text-xs text-slate-300">
              <MessageSquareQuote className="h-4 w-4" />
              Original phrase:
            </span>
            <span className="block pl-6 text-slate-200">
              {originalText ? capitalizeFirstLetter(originalText) : ""}
            </span>
          </p>

          {/* 🔥 PRONUNCIATION BREAKDOWN - Only if score < 80 */}
          {showPronunciationBreakdown && (
            <div className="rounded-lg bg-white/5 p-3">
              <span className="mb-3 flex items-center gap-2 text-xs text-slate-300">
                <Mic2 className="h-4 w-4" />
                Pronunciation Issues:
              </span>
              
              <div className="pl-6 space-y-2">
                <p className="text-xs text-slate-400 mb-2">
                  Words highlighted below need improvement:
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {pronunciationScore.words!.map((word: WordScore, idx: number) => {
                    const scoreColor = getScoreColor(word.quality_score);
                    
                    return (
                      <div
                        key={idx}
                        className={cn(
                          "rounded px-2 py-1 text-sm font-medium border",
                          scoreColor
                        )}
                        title={word.sound_most_like 
                          ? `Sounded like: ${word.sound_most_like}` 
                          : undefined
                        }
                      >
                        <span className="block">{word.word}</span>
                        <span className="block text-xs opacity-75">
                          {word.quality_score}/100
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-emerald-400 mt-3">
                  💡 Tip: Focus on the red and orange words. Click "Listen" below to hear the correct pronunciation.
                </p>
              </div>
            </div>
          )}

          {/* Improved Version */}
          <div className="rounded-lg border border-white/10 bg-white/10 p-3">
            <span className="mb-2 flex items-center gap-2 text-xs text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Improved version:
            </span>
            <span className="mb-4 block pl-6 font-medium text-white">
              {improvedResponse ? improvedResponse.replace(/^"|"$/g, "") : ""}
            </span>

            <span className="flex justify-end border-t border-white/10 pt-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleSpeak(improvedResponse)}
                className="flex items-center gap-2 text-slate-200 hover:bg-white/10 hover:text-white"
              >
                <Volume2 className="h-4 w-4" />
                Listen
              </Button>
            </span>
          </div>
        </div>

        {corrections?.finalNotes && (
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-200">
            <Info className="h-4 w-4 text-sky-300" />
            <span>{corrections.finalNotes}</span>
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};