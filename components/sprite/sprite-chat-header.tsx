// components/sprite/sprite-chat-header.tsx
"use client";

import {
  X,
  Target,
  History,
  Dumbbell,
  FileBarChart,
  Plus,
  MessageSquare,
} from "lucide-react";
import type { ActiveTab } from "./sprite-chat-utils";

interface SpriteChatHeaderProps {
  spriteName: string;
  avatarSrc: string;
  currentLessonTitle: string;
  activeTab: ActiveTab;
  hasActiveTurns: boolean;
  sessionsCount: number;
  onSelectTab: (tab: ActiveTab) => void;
  onStartNewSession: () => void;
  onTriggerReport: () => void;
  onClose: () => void;
}

export function SpriteChatHeader({
  spriteName,
  avatarSrc,
  currentLessonTitle,
  activeTab,
  hasActiveTurns,
  sessionsCount,
  onSelectTab,
  onStartNewSession,
  onTriggerReport,
  onClose,
}: SpriteChatHeaderProps) {
  return (
    <div className="relative z-10 overflow-hidden border-b border-white/10 bg-gradient-to-r from-teal-950/85 via-indigo-950/85 to-slate-950/90 px-6 pt-5 pb-4 shrink-0">
      {/* Row 1: Avatar, Sprite Name, Current Lesson, Close */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-teal-400/50 bg-slate-900 shadow-lg shadow-teal-500/20">
            <img
              src={avatarSrc}
              alt={spriteName}
              className="h-full w-full object-cover object-top"
            />
            <span className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-teal-400 ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                {spriteName}
              </h3>
              <span className="rounded-full bg-teal-400/15 border border-teal-400/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-teal-300">
                AI Tutor
              </span>
            </div>
            <p className="text-xs font-semibold text-indigo-200/90 mt-1">
              <span className="text-teal-400 font-extrabold">Current:</span>{" "}
              {currentLessonTitle}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:bg-white/15 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Row 2: Permanent 3-Tab Navigation Bar (Never mutates) */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-950/60 p-1 border border-white/10">
          <button
            onClick={() => onSelectTab("session")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "session"
                ? "bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Session</span>
          </button>

          <button
            onClick={() => onSelectTab("briefing")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "briefing"
                ? "bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Target className="h-3.5 w-3.5" />
            <span>Briefing</span>
          </button>

          <button
            onClick={() => onSelectTab("history")}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "history"
                ? "bg-gradient-to-r from-indigo-600 to-teal-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History ({sessionsCount})</span>
          </button>
        </div>

        {/* + New Session ONLY shows when there are turns in the current session */}
        {hasActiveTurns && (
          <button
            onClick={onStartNewSession}
            className="flex items-center gap-1.5 rounded-xl border border-teal-400/40 bg-teal-500/15 px-3.5 py-2 text-xs font-extrabold text-teal-300 hover:bg-teal-500/25 transition shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Session</span>
          </button>
        )}
      </div>

      {/* Row 3: Quick Action Pills */}
      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={onTriggerReport}
          className="flex items-center gap-2 rounded-xl border border-indigo-400/30 bg-indigo-500/15 px-3.5 py-1.5 text-xs font-bold text-indigo-200 hover:bg-indigo-500/25 transition shrink-0"
        >
          <FileBarChart className="h-3.5 w-3.5 text-indigo-300" />
          <span>Progress Report</span>
        </button>

        <button
          type="button"
          disabled
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-slate-400 opacity-75 cursor-not-allowed shrink-0"
        >
          <Dumbbell className="h-3.5 w-3.5 text-slate-400" />
          <span>Sprite Exercise</span>
          <span className="rounded-md bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.2 text-[9px] font-black uppercase text-amber-300">
            Soon
          </span>
        </button>
      </div>
    </div>
  );
}