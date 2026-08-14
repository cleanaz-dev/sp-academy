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
  Volume2,
  Mic2,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImprovementTooltipProps, WordAssessment, CorrectionDetail } from "./types";
import { capitalizeFirstLetter, speakPhrase } from "./utils";

export const ImprovementTooltip: React.FC<ImprovementTooltipProps> = ({
  improvedResponse,
  originalText,
  corrections,
  pronunciationScore,
  speakPhrase: customSpeakPhrase,
}) => {
  const handleSpeak = customSpeakPhrase || speakPhrase;

  // Helper to color-code word accuracy scores
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 bg-emerald-500/20 border-emerald-500/30";
    if (score >= 80) return "text-green-400 bg-green-500/20 border-green-500/30";
    if (score >= 70) return "text-amber-400 bg-yellow-500/20 border-yellow-500/30";
    return "text-red-400 bg-red-500/20 border-red-500/30";
  };

  // Check if any word was mispronounced or scored low
  const hasWordIssues = pronunciationScore?.words?.some(
    (w) => (w.accuracyScore ?? 100) < 80 || (w.errorType && w.errorType !== "None")
  );

  // Show breakdown if overall pronunciation score is < 85 OR any single word needs work
  const showPronunciationBreakdown =
    Boolean(pronunciationScore?.words && pronunciationScore.words.length > 0) &&
    ((pronunciationScore?.score ?? 100) < 85 || hasWordIssues);

  // Helper to render granular grammar/vocab correction items
  const renderCorrectionItem = (
    title: string,
    detail?: string | CorrectionDetail
  ) => {
    if (!detail) return null;
    const text = typeof detail === "object" ? detail.correction : detail;
    const reason = typeof detail === "object" ? detail.reason : undefined;

    if (!text) return null;

    return (
      <div className="mb-2 pl-2">
        <span className="font-semibold text-sky-300">{title}: </span>
        <span className="text-white">{text}</span>
        {reason && <p className="text-xs italic text-emerald-300">Why: {reason}</p>}
      </div>
    );
  };

  const hasSpecificCorrections =
    corrections &&
    (corrections.vocabulary ||
      corrections.article ||
      corrections.genderAgreement ||
      corrections.finalNotes);

  const hasImprovedPhrasing =
    Boolean(improvedResponse && improvedResponse.trim() !== "" && improvedResponse !== originalText);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex animate-pulse items-center space-x-1 text-blue-500 shadow-2xl shadow-white transition-transform hover:scale-110"
          title="View detailed feedback"
        >
          <Info className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto rounded-lg border-none bg-gradient-to-r from-indigo-600/95 to-purple-700/95 p-6 text-white shadow-xl backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-semibold text-white">
            <Sparkles className="h-6 w-6 text-yellow-300" />
            <span>Improvement & Feedback</span>
          </DialogTitle>
          <DialogDescription>
            <span className="text-xs text-white/70">
              Review pronunciation and grammar recommendations below
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm text-slate-100">
          {/* 1. Original User Phrase */}
          <div className="rounded-lg bg-white/5 p-3">
            <span className="mb-1 flex items-center gap-2 text-xs text-slate-300">
              <MessageSquareQuote className="h-4 w-4 text-sky-300" />
              Original phrase:
            </span>
            <p className="pl-6 font-medium text-slate-100">
              {originalText ? capitalizeFirstLetter(originalText) : ""}
            </p>
          </div>

          {/* 2. Pronunciation Breakdown (Shows when pronunciation needs attention) */}
          {showPronunciationBreakdown && pronunciationScore?.words && (
            <div className="rounded-lg bg-white/5 p-3">
              <span className="mb-3 flex items-center gap-2 text-xs text-slate-300">
                <Mic2 className="h-4 w-4 text-amber-300" />
                Pronunciation Analysis ({pronunciationScore.score}/100):
              </span>

              <div className="space-y-2 pl-6">
                <p className="mb-2 text-xs text-slate-300">
                  Hover over words below to check accuracy:
                </p>

                <div className="flex flex-wrap gap-2">
                  {pronunciationScore.words.map((word: WordAssessment, idx: number) => {
                    const scoreColor = getScoreColor(word.accuracyScore);

                    return (
                      <div
                        key={idx}
                        className={cn(
                          "rounded border px-2 py-1 text-sm font-medium transition-transform hover:scale-105",
                          scoreColor
                        )}
                        title={
                          word.errorType && word.errorType !== "None"
                            ? `Issue: ${word.errorType}`
                            : `Accuracy: ${word.accuracyScore}/100`
                        }
                      >
                        <span className="block">{word.word}</span>
                        <span className="block text-[10px] opacity-80">
                          {word.accuracyScore}/100
                        </span>
                      </div>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs text-emerald-300">
                  💡 Tip: Focus on the red and orange words when speaking.
                </p>
              </div>
            </div>
          )}

          {/* 3. Improved Phrasing or Positive Grammar Status */}
          {hasImprovedPhrasing ? (
            <div className="rounded-lg border border-white/10 bg-white/10 p-3">
              <span className="mb-1 flex items-center gap-2 text-xs text-emerald-300">
                <Sparkles className="h-4 w-4" />
                Better way to say this:
              </span>
              <p className="mb-4 pl-6 font-medium text-white">
                {improvedResponse.replace(/^"|"$/g, "")}
              </p>

              <div className="flex justify-end border-t border-white/10 pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleSpeak(improvedResponse)}
                  className="flex items-center gap-2 text-slate-200 hover:bg-white/10 hover:text-white"
                >
                  <Volume2 className="h-4 w-4" />
                  Listen
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span>Grammar and phrasing look good!</span>
            </div>
          )}

          {/* 4. Grammar / Vocabulary Breakdown */}
          {hasSpecificCorrections && (
            <div className="space-y-1 rounded-lg bg-white/5 p-3 text-xs text-slate-200">
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-sky-300">
                <BookOpen className="h-4 w-4" />
                Grammar Notes:
              </span>
              {renderCorrectionItem("Vocabulary", corrections.vocabulary)}
              {renderCorrectionItem("Articles", corrections.article)}
              {renderCorrectionItem("Gender Agreement", corrections.genderAgreement)}
              {corrections.finalNotes && (
                <p className="mt-2 border-t border-white/10 pt-2 italic text-slate-300">
                  Note: {typeof corrections.finalNotes === "string" ? corrections.finalNotes : ""}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};