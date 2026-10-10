import Link from "next/link";
import { MessageSquare, Sparkles } from "lucide-react";

export function AiTutorCard() {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-violet-300 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-purple-700 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" /> Free Practice
          </span>
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
        </div>

        <h3 className="mt-3 text-xl font-black text-slate-900">Spoken AI Tutor</h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Put whatever words you've learned into conversational practice with live speech feedback.
        </p>
      </div>

      <Link
        href="/learning-hub/conversation"
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-800 transition hover:bg-slate-900 hover:text-white"
      >
        <MessageSquare className="h-3.5 w-3.5" /> Start Conversation
      </Link>
    </div>
  );
}