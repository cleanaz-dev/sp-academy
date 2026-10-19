import Link from "next/link";
import {
  Mic,
  Sparkles,
  ArrowUpRight,
  BookOpen,
  Gamepad2,
  MessageSquare,
} from "lucide-react";

export function AiTutorCard() {
  return (
    <section className="mt-8">
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md sm:px-5 sm:py-3.5">
        {/* Subtle ambient accent */}
        <div className="pointer-events-none absolute -left-10 top-1/2 h-24 w-48 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          {/* Left: Spoken AI Tutor Primary Callout */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <Mic className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-wider text-indigo-600 uppercase">
                  <Sparkles className="h-3 w-3" /> Free Practice Sandbox
                </span>
              </div>
              <h4 className="text-sm font-black text-slate-900 sm:text-base">
                Spoken AI Tutor &amp; Quick Tools
              </h4>
              <p className="text-xs text-slate-500">
                Practice your banked words in open conversation or jump into a
                quick drill anytime.
              </p>
            </div>
          </div>

          {/* Right: Action Buttons & Future Tool Slots */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Future-ready secondary quick links */}
            <Link
              href="/games"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <Gamepad2 className="h-3.5 w-3.5 text-indigo-500" />
              <span>Practice Games</span>
            </Link>

            <Link
              href="/journal"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/80 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <BookOpen className="h-3.5 w-3.5 text-violet-500" />
              <span>Daily Journal</span>
            </Link>

            {/* Primary Spoken AI Tutor CTA */}
            <Link
              href="/conversation"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-600 active:scale-95"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span>Start AI Conversation</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}