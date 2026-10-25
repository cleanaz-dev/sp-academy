import { Sparkles, BookOpen } from "lucide-react";

interface ContextCardProps {
  title: string;
  grammarRule: string;
  examples: { french: string; english: string }[];
}

export function ContextCard({ title, grammarRule, examples }: ContextCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-indigo-500/40 bg-slate-900 p-4 shadow-lg">
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <Sparkles className="h-4 w-4 text-teal-400" />
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h4>
      </div>
      
      <p className="text-sm font-medium text-slate-200 leading-relaxed">
        {grammarRule}
      </p>

      <div className="flex flex-col gap-2 rounded-xl bg-slate-950/50 p-3 mt-1 border border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-indigo-400 uppercase">
          <BookOpen className="h-3 w-3" /> Examples
        </div>
        {examples.map((ex, i) => (
          <div key={i} className="flex flex-col gap-0.5 border-l-2 border-indigo-500/50 pl-2">
            <span className="text-sm font-bold text-white">{ex.french}</span>
            <span className="text-xs text-slate-400">{ex.english}</span>
          </div>
        ))}
      </div>
    </div>
  );
}