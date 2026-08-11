"use client";

import { AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { usePronunciation } from "@/context/pronunciation-context"; 
import { X, ArrowRight, ChevronRight } from "lucide-react";

// Individual step components
import ProgressSidebar from "./review/progessive-sidebar";
import ListenCompareStep from "./review/listen-compare-step";
import GrammarStep from "./review/grammar-step"
import FinalReadStep from "./review/final-read-step";


interface InteractiveReviewModalProps {
  onClose: () => void;
  onComplete: () => void;
  journal: any; 
}

export default function InteractiveReviewModal({ onClose, onComplete, journal }: InteractiveReviewModalProps) {
  const { isRecording, score, error, assessSpeech, cancelAssessment, reset } = usePronunciation();
  
  // Modal Navigation & Step State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [actionedCards, setActionedCards] = useState<Set<string>>(new Set());
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  
  // Recording State
  const [activeRecordingTarget, setActiveRecordingTarget] = useState<string | "full" | null>(null);
  const [cardScores, setCardScores] = useState<Record<string, any>>({});

  // Data Extraction
  const review = journal?.review || {};
  const originalTranscript = journal?.transcript || "No transcript available.";
  const improvedTranscript = review?.finalTranscript || originalTranscript;
  const translation = review?.translation;
  const targetLanguage = journal?.targetLanguage || journal?.language || "en-US";
  const originalAudioUrl = journal?.audioUrl || (journal?.s3Key ? `/api/audio?key=${journal.s3Key}` : undefined);

  // Parse Grammar & Words
  const grammarSuggestions = useMemo(() => {
    if (!review?.grammarMistakes) return [];
    let parsed = review.grammarMistakes;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) { parsed = []; }
    }
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item: any, index: number) => ({
      id: item.id || `grammar-${index}`,
      original: item.original || "Original text",
      improved: item.improved || "Improved text",
      explanation: item.explanation || "No explanation provided.",
    }));
  }, [review?.grammarMistakes]);

  const mispronouncedWords = useMemo(() => {
    if (!review?.wordAnalysis) return [];
    let parsed = review.wordAnalysis;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) { parsed = []; }
    }
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((w: any) => w.errorType && w.errorType !== "None");
  }, [review?.wordAnalysis]);

  // Map progress to steps
  const hasGrammarStep = grammarSuggestions.length > 0;
  const allCardsActioned = actionedCards.size === grammarSuggestions.length;

  const steps = useMemo(() => {
    const s = [
      { id: 'listen', title: 'Listen & Compare', description: 'Hear the native difference', isComplete: hasPlayedAudio }
    ];
    if (hasGrammarStep) {
      s.push({ id: 'grammar', title: 'Grammar & Phrasing', description: 'Practice specific corrections', isComplete: allCardsActioned });
    }
    s.push({ id: 'final', title: 'Final Read', description: 'Read the complete text aloud', isComplete: practiceCompleted });
    return s;
  }, [hasPlayedAudio, hasGrammarStep, allCardsActioned, practiceCompleted]);

  // Clean up recording hook on close
  useEffect(() => {
    return () => cancelAssessment();
  }, [cancelAssessment]);

  // Sync Azure/Pronunciation Scores with specific steps/cards
  useEffect(() => {
    if (score && !error) {
      if (activeRecordingTarget === "full") {
        setPracticeCompleted(true);
      } else if (activeRecordingTarget) {
        setCardScores((prev) => ({ ...prev, [activeRecordingTarget]: score }));
        setActionedCards((prev) => new Set(prev).add(activeRecordingTarget));
      }
    }
  }, [score, error, activeRecordingTarget]);

  // Actions
  const handlePracticeCard = async (id: string, textToRead: string) => {
    if (isRecording) return cancelAssessment();
    setActiveRecordingTarget(id);
    reset();
    await assessSpeech(textToRead, targetLanguage);
  };

  const handlePracticeToggle = async () => {
    if (isRecording) return cancelAssessment();
    setActiveRecordingTarget("full");
    reset();
    setPracticeCompleted(false);
    await assessSpeech(improvedTranscript, targetLanguage);
  };

  return (
    // FULL PAGE WRAPPER: Fixed inset-0 taking up entire viewport
    <div className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-slate-50 overflow-hidden">
      
      {/* Vertical Sidebar (Full Height on Desktop) - Passes Finish Logic */}
      <ProgressSidebar 
        steps={steps} 
        currentStepIndex={currentStepIndex} 
        setStep={setCurrentStepIndex} 
        onComplete={onComplete}
        canFinish={practiceCompleted} // Requires last step to be completed
      />

      {/* Main Content Area (Takes up remaining width & handles scrolling) */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-slate-50/50">
        
        {/* Header - Stays glued to top of content area */}
        <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 md:px-10 shrink-0 shadow-sm z-10">
          <h3 className="text-xl font-bold text-gray-800">{steps[currentStepIndex].title}</h3>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="h-7 w-7" />
          </button>
        </header>

        {/* Scrollable Main Area - Bottom padding reduced since there's no bottom bar */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 pb-10">
          <AnimatePresence mode="wait">
            {steps[currentStepIndex].id === 'listen' && (
              <ListenCompareStep 
                key="listen"
                originalTranscript={originalTranscript} improvedTranscript={improvedTranscript}
                translation={translation} mispronouncedWords={mispronouncedWords}
                targetLanguage={targetLanguage} originalAudioUrl={originalAudioUrl}
                hasPlayedAudio={hasPlayedAudio} setHasPlayedAudio={setHasPlayedAudio}
                summaryData={{ 
                  summaryFeedback: review?.summaryFeedback, 
                  overallScore: review?.overallScore, 
                  accuracyScore: review?.accuracyScore, 
                  fluencyScore: review?.fluencyScore 
                }}
              />
            )}

            {steps[currentStepIndex].id === 'grammar' && (
              <GrammarStep 
                key="grammar"
                grammarSuggestions={grammarSuggestions} actionedCards={actionedCards}
                handlePracticeCard={handlePracticeCard} 
                handleCardAcknowledge={(id: string) => setActionedCards(prev => new Set(prev).add(id))}
                isRecording={isRecording} activeRecordingTarget={activeRecordingTarget}
                cardScores={cardScores} error={error}
              />
            )}

            {steps[currentStepIndex].id === 'final' && (
              <FinalReadStep 
                key="final"
                improvedTranscript={improvedTranscript}
                isRecording={isRecording} activeRecordingTarget={activeRecordingTarget}
                practiceCompleted={practiceCompleted} score={score} error={error}
                handlePracticeToggle={handlePracticeToggle}
              />
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}