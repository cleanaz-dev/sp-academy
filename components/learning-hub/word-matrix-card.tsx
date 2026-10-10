import Link from "next/link";
import { ArrowRight, Grid3X3 } from "lucide-react";

type WordMatrixCardProps = {
  totalWordsLearned: number;
};

export function WordMatrixCard({ totalWordsLearned }: WordMatrixCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-white p-6 shadow-xs transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-extrabold tracking-wider text-indigo-700 uppercase">
          <Grid3X3 className="h-3.5 w-3.5 text-indigo-600" /> Word Matrix
        </span>
        <span className="text-xs font-extrabold text-indigo-600">
          {totalWordsLearned} Words Banked
        </span>
      </div>

      <h3 className="mt-4 text-xl font-black text-slate-900">Vocabulary Retention</h3>
      <p className="mt-1 text-xs leading-relaxed text-slate-500">
        Words automatically cycle into your retention matrix as you finish lessons and vocab bridges.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-center">
          <span className="block text-2xl font-black text-slate-900">{totalWordsLearned}</span>
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Acquired</span>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 text-center">
          <span className="block text-2xl font-black text-emerald-600">100%</span>
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Mastery</span>
        </div>
      </div>

      <Link
        href="/matrix"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-3 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 active:scale-98"
      >
        Open Word Matrix <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}