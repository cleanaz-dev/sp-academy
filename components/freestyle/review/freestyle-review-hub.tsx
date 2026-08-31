"use client";

import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import { FreestyleAvatarReview } from "./freestyle-avatar-review";
import { FreestyleGrammarReview } from "./freestyle-grammar-review";
import { FreestylePronunciationReview } from "./freestyle-pronunciation-review";
import { useReviewTTS } from "@/hooks/use-review-tts";
import type { ReviewData, SessionData } from "@/lib/types/review";

type Phase =
  | "landing"
  | "preparing"
  | "intro"
  | "grammar"
  | "transition"
  | "pronunciation"
  | "outro"
  | "celebration";

interface ApiResponse {
  session: SessionData;
  review: ReviewData;
}

interface Props {
  sessionId: string;
  onComplete?: () => void; // <-- NEW: Called when user finishes review
}

export function FreestyleReviewHub({ sessionId, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("landing");
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSpeaking, speak } = useReviewTTS();

  useEffect(() => {
    fetch(`/api/freestyle/review/${sessionId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.review) setData(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const getGrade = (score: number) => {
    if (score >= 90) return { letter: "A+", color: "text-green-600", bg: "bg-green-100", border: "border-green-300" };
    if (score >= 80) return { letter: "A", color: "text-green-500", bg: "bg-green-100", border: "border-green-300" };
    if (score >= 70) return { letter: "B", color: "text-blue-500", bg: "bg-blue-100", border: "border-blue-300" };
    if (score >= 60) return { letter: "C", color: "text-yellow-500", bg: "bg-yellow-100", border: "border-yellow-300" };
    return { letter: "D", color: "text-red-500", bg: "bg-red-100", border: "border-red-300" };
  };

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 font-medium">Loading your review...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-500">Review is still being prepared...</p>
          <button
            onClick={onComplete}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { session, review } = data;
  const grade = getGrade(review.metrics.overallScore);

  const grammarMistakes = review.mistakes.filter((m) => m.type === "grammar");
  
  const pronunciationPhrases =
    review.mistakes
      .filter((m) => m.type === "pronunciation")
      .map((m) => m.correction)
      .slice(0, 3);

  const fallbackPhrases = review.mistakes.map((m) => m.correction).slice(0, 3);
  const practicePhrases = pronunciationPhrases.length > 0 ? pronunciationPhrases : fallbackPhrases;

  const hasGrammar = grammarMistakes.length > 0;
  const hasPronunciation = practicePhrases.length > 0;

  const startReview = () => {
    setPhase("preparing");
    setTimeout(() => {
      if (!hasGrammar && !hasPronunciation) {
        setPhase("outro");
        speak(review.overallFeedback.encouragement, session.nativeLanguage, () =>
          setPhase("celebration")
        );
        return;
      }

      setPhase("intro");
      const text = hasGrammar
        ? `${review.overallFeedback.summary} Let's review your grammar.`
        : `${review.overallFeedback.summary} Let's practice your pronunciation.`;

      speak(text, session.nativeLanguage, () => setPhase(hasGrammar ? "grammar" : "pronunciation"));
    }, 1200);
  };

  const handleGrammarComplete = () => {
    if (hasPronunciation) {
      setPhase("transition");
      speak("Great job! Now let's practice your pronunciation.", session.nativeLanguage, () =>
        setPhase("pronunciation")
      );
    } else {
      setPhase("outro");
      speak(review.overallFeedback.encouragement, session.nativeLanguage, () =>
        setPhase("celebration")
      );
    }
  };

  const handlePronunciationComplete = () => {
    setPhase("outro");
    const text = `${review.overallFeedback.encouragement} You did amazing today!`;
    speak(text, session.nativeLanguage, () => {
      setPhase("celebration");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366F1", "#10B981", "#F59E0B", "#EC4899"],
      });
    });
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="max-w-lg mx-auto pt-6 space-y-6">
        <div className="flex justify-center">
          <FreestyleAvatarReview isSpeaking={isSpeaking} />
        </div>

        {/* LANDING */}
        {phase === "landing" && (
          <div className="text-center space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-black text-gray-800">Session Review</h1>

            <div
              className={`w-36 h-36 rounded-full ${grade.bg} ${grade.border} border-4 flex flex-col items-center justify-center mx-auto shadow-lg`}
            >
              <span className={`text-7xl font-black ${grade.color}`}>{grade.letter}</span>
              <span className="text-gray-500 font-bold text-sm">{review.metrics.overallScore}%</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Grammar", value: review.metrics.grammarScore },
                { label: "Vocabulary", value: review.metrics.vocabScore },
                { label: "Pronunciation", value: review.metrics.pronunciationScore ?? "N/A" },
                { label: "Fluency", value: review.metrics.fluencyScore },
              ].map((m) => (
                <div key={m.label} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">{m.label}</div>
                  <div className="text-xl font-bold text-gray-800">{m.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-100 text-left space-y-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Strengths</p>
              <ul className="space-y-1">
                {review.overallFeedback.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span>💪</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={startReview}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
            >
              Start Review 🚀
            </button>
          </div>
        )}

        {/* PREPARING */}
        {phase === "preparing" && (
          <div className="text-center py-16 animate-in fade-in">
            <p className="text-xl font-bold text-gray-700">Get ready...</p>
            <p className="text-gray-400 mt-2">Your AI tutor is preparing your session.</p>
          </div>
        )}

        {/* INTRO / TRANSITION / OUTRO */}
        {(phase === "intro" || phase === "transition" || phase === "outro") && (
          <div className="text-center py-16 animate-in fade-in">
            <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <span className="text-gray-600 font-medium">
                {isSpeaking ? "AI Tutor is speaking..." : "Loading audio..."}
              </span>
            </div>
          </div>
        )}

        {/* GRAMMAR */}
        {phase === "grammar" && (
          <FreestyleGrammarReview mistakes={grammarMistakes} onComplete={handleGrammarComplete} />
        )}

        {/* PRONUNCIATION */}
        {phase === "pronunciation" && (
          <FreestylePronunciationReview
            phrases={practicePhrases}
            targetLanguage={session.targetLanguage}
            onComplete={handlePronunciationComplete}
          />
        )}

        {/* CELEBRATION */}
        {phase === "celebration" && (
          <div className="text-center space-y-6 py-8 animate-in zoom-in duration-500">
            <div className="text-6xl space-x-2">🎉🏆✨</div>
            <h2 className="text-4xl font-black text-gray-800">Review Complete!</h2>
            <p className="text-lg text-gray-600">You're getting better every session.</p>
            <div className="flex justify-center gap-4 text-5xl">
              <span>🔥</span>
              <span>💪</span>
              <span>🎯</span>
            </div>
            <button
              onClick={onComplete}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}