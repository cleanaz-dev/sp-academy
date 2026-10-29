// components/sprite/sprite-chat-chalkboard.tsx
"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, BarChart3, Sparkles, ArrowRight } from "lucide-react";
import type { ChalkboardData } from "@/lib/schema/sprite-schema";
import { cleanDisplayString } from "./sprite-chat-utils";

interface SpriteChatChalkboardProps {
  board: ChalkboardData;
}

export function SpriteChatChalkboard({ board }: SpriteChatChalkboardProps) {
  if (!board || !Array.isArray(board.items) || board.items.length === 0) {
    return null;
  }

  const modeConfig = {
    lesson_notes: {
      badge: "Chalkboard Notes",
      Icon: BookOpen,
      accent: "text-teal-300 border-teal-500/30 bg-teal-500/10",
    },
    correction: {
      badge: "Form & Spelling Fix",
      Icon: CheckCircle2,
      accent: "text-amber-300 border-amber-500/30 bg-amber-500/10",
    },
    progress_snapshot: {
      badge: "Data Snapshot",
      Icon: BarChart3,
      accent: "text-indigo-300 border-indigo-500/30 bg-indigo-500/10",
    },
  }[board.mode || "lesson_notes"];

  const ModeIcon = modeConfig.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border-2 border-slate-700/80 bg-[#0A131A] p-5 shadow-[inset_0_2px_24px_rgba(0,0,0,0.75)]"
    >
      {/* Subtle chalk dust radial glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-teal-400/5 blur-2xl" />

      {/* Chalkboard Top Tray / Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shrink-0 ${modeConfig.accent}`}
          >
            <ModeIcon className="h-3 w-3" />
            {modeConfig.badge}
          </span>
          <h4 className="text-sm font-extrabold text-white truncate">
            {cleanDisplayString(board.title)}
          </h4>
        </div>
      </div>

      {/* Chalkboard Rows */}
      <div className="space-y-3">
        {board.items.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {cleanDisplayString(item.label)}
              </span>

              {/* Optional Correction: shows `Jai` crossed out -> `J'ai` */}
              <div className="flex items-center gap-2 font-mono text-xs">
                {item.correctionFrom && (
                  <>
                    <span className="text-rose-400/90 line-through decoration-rose-500/80">
                      {cleanDisplayString(item.correctionFrom)}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-500" />
                  </>
                )}
                <span className="font-bold text-teal-300 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded-md">
                  {cleanDisplayString(item.target)}
                </span>
              </div>
            </div>

            <p className="mt-1.5 text-xs font-medium text-slate-300 leading-relaxed">
              {cleanDisplayString(item.detail)}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Chalk Ledge Takeaway */}
      {board.takeaway && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-950/30 px-3.5 py-2 text-xs font-semibold text-indigo-200">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
          <span>{cleanDisplayString(board.takeaway)}</span>
        </div>
      )}
    </motion.div>
  );
}