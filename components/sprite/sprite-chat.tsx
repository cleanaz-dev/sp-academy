// components/sprite/sprite-chat.tsx
"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Mic, EyeOff, BrainCircuit } from "lucide-react";
import { useSprite } from "@/context/sprite-context";

interface SpriteChatProps {
  userId: string;
}

// AI SDK 5+ messages store content as `parts`; join the text parts into a string
function getText(m: UIMessage): string {
  return m.parts
    .filter((p): p is Extract<typeof p, { type: "text" }> => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export function SpriteChat({ userId }: SpriteChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showContext, setShowContext] = useState(true);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { summonSprite, profile } = useSprite();
  const lastSummonedId = useRef<string | null>(null);

  const isVivi = profile?.sprite?.slug === "vivi";
  const spriteName = profile?.sprite?.name ?? (isVivi ? "Vivi" : "Vox");
  const avatarSrc = profile?.sprite?.avatarUrl || (isVivi ? "/sprite-f.png" : "/sprite-m.png");

  const aiBrain = profile?.context || {
    userName: "Student",
    nativeLang: "English",
    targetLang: profile?.targetLanguage || "French",
    currentLessonTitle: "your active lesson",
    topWord: "bonjour",
    recentWords: "",
    avgPronunciation: 0,
    avgMastery: 0,
  };

  // The transport is created once, so it reads the latest values through a ref
  const bodyRef = useRef({ spriteName, dossier: aiBrain });
  bodyRef.current = { spriteName, dossier: aiBrain };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/users/${userId}/sprite/chat`,
        body: () => bodyRef.current,
      }),
    [userId],
  );

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    sendMessage({ text });
    setInput("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showContext]);

  useEffect(() => {
    if (isLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    const text = getText(lastMessage);
    if (text && lastSummonedId.current !== lastMessage.id) {
      lastSummonedId.current = lastMessage.id;
      summonSprite({
        id: lastMessage.id,
        badge: "AI Tutor",
        text,
        position: "bottom-left",
        duration: Infinity,
      });
    }
  }, [messages, isLoading, summonSprite]);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
            <div className="hidden sm:flex flex-col items-end rounded-2xl border border-indigo-500/30 bg-slate-950/90 px-3.5 py-2 text-right shadow-xl backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                {aiBrain.currentLessonTitle}
              </span>
              <span className="text-xs font-bold text-white">Chat with {spriteName}</span>
            </div>

            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white/40 bg-slate-900 shadow-2xl transition-transform group-hover:scale-105">
              <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="fixed bottom-6 right-6 z-40 flex h-[620px] w-[400px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-950/95 shadow-2xl shadow-indigo-950/60 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/60 px-5 py-3.5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-xl border border-white/20 bg-slate-800">
                  <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {spriteName}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 truncate max-w-[180px]">
                    Live Tutor Session
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {showContext && (
                <div className="relative flex flex-col gap-2 rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-4">
                  <button
                    onClick={() => setShowContext(false)}
                    className="absolute right-3 top-3 flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <EyeOff className="h-3 w-3" /> HIDE
                  </button>
                  <div className="flex items-center gap-2 border-b border-indigo-500/20 pb-2">
                    <BrainCircuit className="h-4 w-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Active Context</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mt-1">
                    <div>
                      <span className="block text-slate-500 font-semibold uppercase text-[9px]">Lesson</span>
                      <span className="font-medium text-slate-200">{aiBrain.currentLessonTitle}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-semibold uppercase text-[9px]">Focus Word</span>
                      <span className="font-medium text-slate-200">{aiBrain.topWord || "None"}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-semibold uppercase text-[9px]">Pronunciation</span>
                      <span className="font-medium text-slate-200">{aiBrain.avgPronunciation}% Avg</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 font-semibold uppercase text-[9px]">Language</span>
                      <span className="font-medium text-slate-200">{aiBrain.targetLang}</span>
                    </div>
                  </div>
                </div>
              )}

              {!showContext && (
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowContext(true)}
                    className="rounded-full bg-slate-800/50 px-3 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-200 transition border border-slate-700/50"
                  >
                    SHOW CONTEXT
                  </button>
                </div>
              )}

              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center text-center opacity-50 pt-8">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-slate-700 bg-slate-800 mb-3 grayscale">
                    <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                  </div>
                  <p className="text-sm font-medium text-slate-300">
                    Send a message to practice your {aiBrain.targetLang}.
                  </p>
                </div>
              )}

              {messages.map((m) => (
                <div key={m.id} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/20 bg-slate-800">
                      <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed ${
                    m.role === "user" ? "rounded-br-sm bg-indigo-600 text-white" : "rounded-bl-sm bg-slate-800 text-slate-200 border border-slate-700/60"
                  }`}>
                    {getText(m)}
                  </div>
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/20 bg-slate-800">
                    <img src={avatarSrc} alt={spriteName} className="h-full w-full object-cover object-top" />
                  </div>
                  <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-slate-800 px-4 py-3 border border-slate-700">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 bg-slate-900/60 p-3.5 shrink-0">
              <form onSubmit={handleSubmit} className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-2 py-1.5 transition-colors focus-within:border-indigo-500">
                <button type="button" className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white">
                  <Mic className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Chat in ${aiBrain.targetLang}...`}
                  disabled={isLoading}
                  maxLength={1000}
                  className="w-full bg-transparent py-1.5 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button type="submit" disabled={isLoading || !input.trim()} className="rounded-xl bg-indigo-600 p-2 text-white transition hover:bg-indigo-500 disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}