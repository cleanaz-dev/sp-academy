import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import { Clock, CheckCircle, MessageSquare } from "lucide-react";

export default async function FreestyleReviewList() {
  const user = await currentUser();
  if (!user) return null;

  // 1. Fetch all sessions for this user, including their review data
  const sessions = await prisma.freestyleSession.findMany({
    where: { userId: user.id },
    include: { review: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col space-y-3 p-4">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
        Session History
      </h2>
      
      {sessions.length === 0 ? (
        <p className="text-sm text-slate-500">No sessions yet.</p>
      ) : (
        sessions.map((session) => {
          const isReviewed = session.status === "REVIEWED";
          const isPending = session.status === "REVIEW_PENDING";
          // 2. Check the boolean we added to the DB!
          const hasNewFeedback = isReviewed && session.review && !session.review.hasUserReviewed;

          return (
            <Link
              // Change this route to wherever your review page lives
              href={`/freestyle/review/${session.id}`}
              key={session.id}
              className="relative flex flex-col p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all bg-white shadow-sm"
            >
              {/* UNREAD NOTIFICATION DOT */}
              {hasNewFeedback && (
                <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-white"></span>
                </span>
              )}

              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-sm text-slate-700 truncate pr-2 capitalize">
                  {session.topic || session.mode.toLowerCase()}
                </span>
                
                {/* STATUS BADGES */}
                {isReviewed ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    <CheckCircle className="w-3 h-3" /> REVIEWED
                  </span>
                ) : isPending ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                    <Clock className="w-3 h-3" /> PENDING
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                    <MessageSquare className="w-3 h-3" /> {session.status}
                  </span>
                )}
              </div>

              <div className="flex items-center text-xs text-slate-500 gap-1.5">
                <span className="font-medium text-slate-600">{session.targetLanguage}</span>
                <span>•</span>
                <span className="capitalize">{session.level.toLowerCase()}</span>
                <span>•</span>
                <span>{new Date(session.createdAt).toLocaleDateString()}</span>
              </div>
            </Link>
          );
        })
      )}
    </div>
  );
}