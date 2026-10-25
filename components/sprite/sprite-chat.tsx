// components/sprite/sprite-chat.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, MessageSquare, Mic, Sparkles } from "lucide-react";
import { useSprite } from "@/context/sprite-context";

// 1. We define the exact "Dossier" of data the AI gets to know about the user.
export interface ChatDossier {
  userName: string;
  nativeLang: string;
  targetLang: string;
  currentLessonTitle: string;
  topWord: string;
  recentWords: string;
  avgPronunciation: number;
  avgMastery: number;
}

interface SpriteChatProps {
  userId: string;
  dossier: ChatDossier;
}

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function SpriteChat({ userId, dossier }: SpriteChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastSummonedId = useRef<string | null>(null);

  // Grab the profile from your existing context so we don't hit the DB
  const { summonSprite, profile } = useSprite();

  const spriteName = profile?.sprite?.name || "Vox";

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    const assistantId = crypto.randomUUID();
    const history = [...messages, userMsg];

    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const setAssistantText = (content: string) =>
      setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content } : m)));

    try {
      // 2. We pass the ENTIRE dossier straight to the backend
      const res = await fetch(`/api/users/${userId}/sprite/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          spriteName,
          dossier,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Chat request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setAssistantText(acc);
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error(err);
      setAssistantText("Sorry, something went wrong. Try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isLoading) return;
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage &&
      lastMessage.role === "assistant" &&
      lastMessage.content &&
      lastSummonedId.current !== lastMessage.id
    ) {
      lastSummonedId.current = lastMessage.id;
      summonSprite({
        id: lastMessage.id,
        badge: "AI Tutor",
        text: lastMessage.content,
        position: "bottom-left",
        duration: Infinity,
      });
    }
  }, [messages, isLoading, summonSprite]);

  const lastMessage = messages[messages.length - 1];
  const waitingForFirstChunk =
    isLoading && lastMessage?.role === "assistant" && lastMessage.content === "";

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/50 transition-transform hover:scale-105 active:scale-95"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Start AI Conversation</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="fixed bottom-6 right-6 z-40 flex h-[600px] w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-3xl border border-indigo-500/30 bg-slate-950/90 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/50 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Spoken AI Tutor</h3>
                  <p className="text-[10px] font-medium tracking-wide text-teal-400 uppercase">
                    Live Session
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center opacity-50">
                  <MessageSquare className="mb-3 h-10 w-10 text-slate-400" />
                  <p className="text-sm font-medium text-slate-300">
                    Say hello to start the conversation!
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {messages
                    .filter((m) => m.content !== "")
                    .map((m) => (
                      <div
                        key={m.id}
                        className={`flex w-full ${
                          m.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed ${
                            m.role === "user"
                              ? "rounded-br-sm bg-indigo-600 text-white"
                              : "rounded-bl-sm bg-slate-800 text-slate-200"
                          }`}
                        >
                          {m.content}
                        </div>
                      </div>
                    ))}
                  {waitingForFirstChunk && (
                    <div className="flex w-full justify-start">
                      <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-slate-800 px-4 py-3">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="border-t border-white/10 bg-slate-900/50 p-4">
              <form
                onSubmit={handleSubmit}
                className="flex items-end gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-1.5 transition-colors focus-within:border-indigo-500"
              >
                <button
                  type="button"
                  className="shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-white/5 hover:text-white"
                >
                  <Mic className="h-5 w-5" />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Type in ${dossier.targetLang}...`}
                  disabled={isLoading}
                  maxLength={1000}
                  className="max-h-32 w-full bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
                />

                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 rounded-xl bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600"
                >
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