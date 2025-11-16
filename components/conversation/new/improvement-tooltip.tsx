import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Info,
  Sparkles,
  MessageSquareQuote,
  CircleCheck,
  GraduationCap,
  Book,
  PenTool,
  Volume2,
} from 'lucide-react';
import type { ImprovementTooltipProps } from './types';
import { capitalizeFirstLetter } from './utils';
import { speakPhrase } from './utils';

export const ImprovementTooltip: React.FC<ImprovementTooltipProps> = ({
  improvedResponse,
  originalText,
  corrections,
  speakPhrase: customSpeakPhrase, // Allow override via props
}) => {
  const handleSpeak = customSpeakPhrase || speakPhrase;

  console.log('Full corrections object:', corrections);

  const renderCorrectionCategory = (
    title: string,
    correction: string | { correction: string; reason?: string } | undefined,
    icon: React.ReactNode,
  ) => {
    if (!correction) return null;

    console.log(`${title} correction:`, correction);

    return (
      <div className="mb-3 pl-2">
        <div className="mb-1 flex items-center gap-2 text-sm text-slate-300">
          {icon}
          {title}:
        </div>
        <div className="space-y-1 pl-6">
          <div className="text-white">
            {typeof correction === 'object' ? correction.correction : correction}
          </div>
          {typeof correction === 'object' && correction.reason && (
            <div className="text-xs italic text-emerald-400">
              Why: {correction.reason}
            </div>
          )}
        </div>
      </div>
    );
  };

  console.log('Gender Agreement:', corrections?.genderAgreement);
  console.log('Vocabulary:', corrections?.vocabulary);
  console.log('Article:', corrections?.article);
  console.log('Additional Notes:', corrections?.additionalNotes);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex animate-pulse items-center space-x-1 text-white shadow-2xl shadow-white transition-transform hover:scale-110">
          <Info className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl rounded-lg border-none bg-gradient-to-r from-indigo-600/70 to-purple-700/70 p-6 text-white shadow-xl backdrop-blur-md">
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
          <p className="rounded-lg bg-white/5 p-3">
            <span className="mb-2 flex items-center gap-2 text-xs text-slate-300">
              <MessageSquareQuote className="h-4 w-4" />
              Original phrase:
            </span>
            <span className="block pl-6 text-slate-200">
              {originalText ? capitalizeFirstLetter(originalText) : ''}
            </span>
          </p>

          <div className="rounded-lg bg-white/5 p-3">
            <span className="mb-2 flex items-center gap-2 text-xs">
              <CircleCheck className="h-4 w-4 text-green-600" />
              <span className="text-slate-300">Corrections:</span>
            </span>

            {corrections?.genderAgreement &&
              renderCorrectionCategory(
                'Gender Agreement',
                corrections.genderAgreement,
                <GraduationCap className="h-4 w-4" />,
              )}

            {corrections?.vocabulary &&
              renderCorrectionCategory(
                'Vocabulary',
                corrections.vocabulary,
                <Book className="h-4 w-4" />,
              )}

            {corrections?.article &&
              renderCorrectionCategory(
                'Article',
                corrections.article,
                <PenTool className="h-4 w-4" />,
              )}
          </div>

          <div className="rounded-lg border border-white/10 bg-white/10 p-3">
            <span className="mb-2 flex items-center gap-2 text-xs text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Improved version:
            </span>
            <span className="mb-4 block pl-6 font-medium text-white">
              {improvedResponse ? improvedResponse.replace(/^"|"$/g, '') : ''}
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