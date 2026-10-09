import { Calendar,  Target } from "lucide-react";
import Link from "next/link";
import { formatDate } from "../utils";



export function ConversationCard({ review }) {
  const mistakesCount = review.mistakes?.length || 0;
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-xs border border-gray-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
      <div>
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {review.conversation?.title || "Structured Conversation"}
          </h3>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Target className="h-4 w-4" />
          </span>
        </div>

        <div className="mb-6 flex items-center gap-1.5 text-sm text-gray-500 font-medium">
          <Calendar className="h-4 w-4 text-indigo-400" />
          {formatDate(review.createdAt)}
        </div>

        <div className="mb-6 flex items-center justify-between rounded-xl bg-indigo-50 p-3 border border-indigo-100/50">
           <span className="text-sm font-bold text-indigo-900">Corrections Made</span>
           <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
             {mistakesCount}
           </span>
        </div>
      </div>

      <Link href={`/learning-hub/conversation/${review.conversationId}`} className="mt-auto w-full">
        <button className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-100 bg-white text-indigo-600 py-2 text-sm font-bold hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
          View Corrections
        </button>
      </Link>
    </div>
  );
}