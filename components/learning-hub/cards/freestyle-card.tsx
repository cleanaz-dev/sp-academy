import { Calendar, ChevronRight, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatDate } from "../utils";


export function FreestyleCard({ session }) {
  const isReady = !!session.review;
  const mistakesCount = session.review?.mistakes?.length || 0;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-xs border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10">
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {session.topic || "Open Conversation"}
          </h3>
          <span className="shrink-0 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
            {session.targetLanguage}
          </span>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600 tracking-wider">
            {session.mode}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold text-gray-600 tracking-wider">
            {session.level}
          </span>
        </div>

        <div className="mb-6 flex items-center gap-6 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-violet-400" />
            {formatDate(session.createdAt)}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-violet-400" />
            {Math.round(session.duration / 60)} min
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        {isReady ? (
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
              <Sparkles className="h-3 w-3 text-emerald-600" />
            </span>
            <span className="text-xs font-bold text-emerald-700">
              {mistakesCount} Notes
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500"></span>
            </span>
            <span className="text-xs font-bold text-amber-600">Processing...</span>
          </div>
        )}

        <Link href={`/learning-hub/freestyle/${session.id}`}>
          <button
            disabled={!isReady}
            className={`flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              isReady
                ? "bg-violet-600 text-white hover:bg-violet-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            Review <ChevronRight className="h-4 w-4" />
          </button>
        </Link>
      </div>
    </div>
  );
}