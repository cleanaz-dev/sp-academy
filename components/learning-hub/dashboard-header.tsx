import { Flame, Globe2, Trophy } from "lucide-react";

type DashboardHeaderProps = {
  lang: { nativeLanguage: string; targetLanguage: string | null | any };
  completedCount: number;
  streak: number;
};

export function DashboardHeader({ lang, completedCount, streak }: DashboardHeaderProps) {
  return (
    <header className="relative overflow-hidden  pt-10 pb-20 text-white shadow-xl">


      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-200 backdrop-blur-md">
            <Globe2 className="h-4 w-4 text-violet-400" />
            <span>
              Learning <strong className="text-white uppercase">{lang?.targetLanguage ?? "French"}</strong> from{" "}
              <span className="text-slate-400">{lang?.nativeLanguage ?? "English"}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Flame className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span>Streak: {streak}</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-300">
              <Trophy className="h-4 w-4 text-emerald-400" />
              <span>{completedCount} Completed</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl">
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            Ready to learn today?
          </h1>
          <p className="mt-2 text-base text-slate-300 sm:text-lg">
            Master essential speech patterns step-by-step through bite-sized interactive audio lessons.
          </p>
        </div>
      </div>
    </header>
  );
}