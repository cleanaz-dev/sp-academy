"use client";

import { useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

// Types matching your Prisma Schema + Webhook output
type ReviewDetailProps = {
  session: any; // Pass the FreestyleSession with relation { review: true }
};

export default function FreestyleReviewDetail({ session }: ReviewDetailProps) {
  const review = session?.review;

  // 1. Mark as viewed when they open this component!
  useEffect(() => {
    if (review && !review.hasUserViewed) {
      fetch(`/api/freestyle/review/${session.id}/view`, { method: "PATCH" });
    }
  }, [review, session.id]);

  if (session.status === "REVIEW_PENDING") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-500 h-full p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
        <h2 className="text-xl font-semibold text-slate-700">Analyzing your session...</h2>
        <p className="mt-2 text-sm">Our AI is currently generating your feedback and metrics.</p>
      </div>
    );
  }

  if (!review) {
    return <div className="p-8 text-center text-red-500">Review data not found.</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-white h-full">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* HEADER & METRICS */}
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2 capitalize">
            {session.topic || session.mode.toLowerCase()} Review
          </h1>
          <p className="text-slate-500 mb-6">Completed on {new Date(session.createdAt).toLocaleDateString()}</p>
          
          {/* SCORES ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Overall" score={review.metrics?.overallScore} isMain />
            <MetricCard label="Pronunciation" score={review.metrics?.pronunciationScore} />
            <MetricCard label="Grammar" score={review.metrics?.grammarScore} />
            <MetricCard label="Vocabulary" score={review.metrics?.vocabScore} />
          </div>
        </div>

        {/* OVERALL FEEDBACK */}
        {review.overallFeedback && (
          <section>
            <h2 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <CheckCircle className="text-emerald-500 w-5 h-5" /> Overall Feedback
            </h2>
            <div className="bg-indigo-50/50 p-5 rounded-xl text-slate-700 leading-relaxed border border-indigo-100">
              {review.overallFeedback}
            </div>
          </section>
        )}

        {/* MISTAKES & CORRECTIONS */}
        <section>
          <h2 className="text-xl font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <AlertCircle className="text-rose-500 w-5 h-5" /> Mistakes & Corrections
          </h2>
          
          {review.mistakes?.length === 0 ? (
            <p className="text-slate-500 italic">No major mistakes detected! Great job.</p>
          ) : (
            <div className="space-y-4">
              {review.mistakes.map((mistake: any, idx: number) => (
                <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="mb-2">
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wide">You said:</span>
                    <p className="text-slate-700 font-medium mt-1">"{mistake.originalText || mistake.userText}"</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Correction:</span>
                    <p className="text-slate-700 mt-1">"{mistake.correction}"</p>
                  </div>
                  <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">
                    <span className="font-semibold text-slate-600">Explanation: </span> 
                    {mistake.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Helper component for the score boxes
function MetricCard({ label, score, isMain = false }: { label: string, score?: number, isMain?: boolean }) {
  if (score === undefined) return null;
  return (
    <div className={`p-4 rounded-xl border ${isMain ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
      <div className={`text-xs font-bold uppercase mb-1 ${isMain ? 'text-indigo-200' : 'text-slate-400'}`}>
        {label}
      </div>
      <div className="text-3xl font-black">
        {score}<span className={`text-lg font-medium ${isMain ? 'text-indigo-300' : 'text-slate-400'}`}>/100</span>
      </div>
    </div>
  );
}