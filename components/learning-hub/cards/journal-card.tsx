import { Activity, Calendar } from "lucide-react";
import Link from "next/link";
import { formatDate } from "../utils";



export function JournalCard({ journal }) {
  const isReady = journal.review && journal.review.overallScore !== null;
  const score = isReady ? journal.review.overallScore : 0;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-xs border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10">
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Daily Journal</h3>
          <span className="shrink-0 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">
            {journal.language || "en-US"}
          </span>
        </div>

        <div className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 font-medium">
          <Calendar className="h-4 w-4 text-teal-400" />
          {formatDate(journal.entryDate)}
        </div>

        {isReady ? (
          <div className="mb-6 rounded-2xl bg-linear-to-br from-teal-50 to-emerald-50 p-4 border border-teal-100/50">
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-bold text-teal-900">Overall Score</span>
              <span className="text-3xl font-extrabold text-teal-600 leading-none">
                {score}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-teal-100 mt-2">
              <div 
                className="h-full bg-teal-500 rounded-full transition-all duration-1000" 
                style={{ width: `${score}%` }} 
              />
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-2xl bg-gray-50 p-4 border border-gray-100 flex items-center justify-center min-h-[90px]">
            <span className="text-sm font-medium text-gray-400 italic">Score pending...</span>
          </div>
        )}
      </div>

      <Link href={`/learning-hub/journal/${journal.id}`} className="mt-auto w-full">
        <button className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-50 text-teal-700 py-2.5 text-sm font-bold hover:bg-teal-100 transition-colors">
          <Activity className="h-4 w-4" /> View Analysis
        </button>
      </Link>
    </div>
  );
}