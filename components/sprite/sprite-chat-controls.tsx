// components/sprite/sprite-chat-controls.tsx
"use client";

import type { FormEvent } from "react";
import { Mic, Send } from "lucide-react";

interface SpriteChatControlsProps {
  input: string;
  isLoading: boolean;
  spriteName: string;
  targetLang: string;
  onInputChange: (val: string) => void;
  onSubmit: (e: FormEvent) => void;
}

export function SpriteChatControls({
  input,
  isLoading,
  spriteName,
  targetLang,
  onInputChange,
  onSubmit,
}: SpriteChatControlsProps) {
  return (
    <div className="relative z-10 border-t border-white/10 bg-slate-950/90 px-6 py-4 shrink-0">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 rounded-2xl border border-indigo-500/30 bg-slate-900/90 px-3.5 py-2 transition-colors focus-within:border-teal-400 shadow-inner"
      >
        <button
          type="button"
          className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-teal-300"
        >
          <Mic className="h-4 w-4" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={`Ask ${spriteName} in ${targetLang}...`}
          disabled={isLoading}
          maxLength={1000}
          className="w-full bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 p-2.5 text-white shadow-md shadow-indigo-600/30 transition hover:opacity-95 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}