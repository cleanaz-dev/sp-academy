// components/sprite/sprite-chat.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { useSprite } from "@/context/sprite-context";
import { SpriteChatHeader } from "./sprite-chat-header";
import { SpriteChatMessages } from "./sprite-chat-messages";
import { SpriteChatControls } from "./sprite-chat-controls";
import {
  parseMessagePayload,
  turnsToUIMessages,
  groupUIMessagesIntoTurns,
  type ActiveTab,
  type ChatContextData,
} from "./sprite-chat-utils";
import type { SpriteSessionData } from "@/lib/schema/sprite-schema";

export type { ChatContextData } from "./sprite-chat-utils";

interface SpriteChatProps {
  userId: string;
  initialContext?: ChatContextData;
}

export function SpriteChat({ userId, initialContext }: SpriteChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ActiveTab>("briefing");

  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [sessionsList, setSessionsList] = useState<SpriteSessionData[]>([]);
  const [selectedTurnIndex, setSelectedTurnIndex] = useState<number | null>(null);
  const [input, setInput] = useState("");

  const { summonSprite, profile } = useSprite();
  const lastSummonedId = useRef<string | null>(null);

  const isVivi = profile?.sprite?.slug === "vivi";
  const rawName = profile?.sprite?.name ?? (isVivi ? "Vivi" : "Vox");
  const spriteName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
  const avatarSrc = profile?.sprite?.avatarUrl || (isVivi ? "/sprite-f.png" : "/sprite-m.png");

  const aiBrain: ChatContextData = initialContext || {
    userName: "Student",
    nativeLang: "English",
    targetLang: profile?.targetLanguage || "French",
    currentLessonTitle: "Active Lesson",
    avgPronunciation: 0,
  };

  const apiDossier = {
    ...aiBrain,
    topWord: aiBrain.topWord?.word || "",
    recentWords: aiBrain.recentWords?.map((w) => w.word).join(", ") || "",
  };

  const bodyRef = useRef({ sessionId, spriteName, dossier: apiDossier });
  bodyRef.current = { sessionId, spriteName, dossier: apiDossier };

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/users/${userId}/sprite/chat`,
      }),
    [userId]
  );

  const { messages, setMessages, sendMessage, status, error } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";

  // Helper that guarantees sessionId & dossier are passed on every request
  const sendWithSessionBody = useCallback(
    (text: string) => {
      sendMessage({ text }, { body: bodyRef.current });
    },
    [sendMessage]
  );

  const turns = useMemo(() => groupUIMessagesIntoTurns(messages), [messages]);
  const hasActiveTurns = turns.length > 0;

  const currentTurnIdx =
    selectedTurnIndex !== null && turns[selectedTurnIndex]
      ? selectedTurnIndex
      : Math.max(0, turns.length - 1);

  const activeTurn = turns[currentTurnIdx];

  const activeAssistantPayload = useMemo(
    () => parseMessagePayload(activeTurn?.assistantMessage),
    [activeTurn?.assistantMessage]
  );

  const effectiveTab: ActiveTab =
    viewMode === "sessions"
      ? "sessions"
      : viewMode === "stage" && hasActiveTurns
      ? "stage"
      : "briefing";

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${userId}/sprite/sessions`);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.sessions)) {
        setSessionsList(data.sessions);
      }
    } catch (e) {
      console.error("Failed to fetch sprite sessions:", e);
    }
  }, [userId]);

  useEffect(() => {
    if (isOpen) {
      fetchSessions();
    }
  }, [isOpen, fetchSessions]);

  useEffect(() => {
    if (!isLoading && messages.length > 0 && isOpen) {
      const timer = setTimeout(() => fetchSessions(), 450);
      return () => clearTimeout(timer);
    }
  }, [isLoading, messages.length, isOpen, fetchSessions]);

  const startNewSession = () => {
    setSessionId(crypto.randomUUID());
    setMessages([]);
    setSelectedTurnIndex(null);
    setViewMode("briefing");
  };

  const selectSession = (session: SpriteSessionData) => {
    setSessionId(session.id);
    const loadedMessages = turnsToUIMessages(session.turns || []);
    setMessages(loadedMessages);
    setSelectedTurnIndex(null);
    setViewMode("stage");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setSelectedTurnIndex(null);
    setViewMode("stage");
    sendWithSessionBody(text);
    setInput("");
  };

  const triggerPractice = (word: string) => {
    if (isLoading) return;
    setSelectedTurnIndex(null);
    setViewMode("stage");
    sendWithSessionBody(`Help me practice how to use "${word}"`);
  };

  const handleQuickPrompt = (promptText: string) => {
    if (isLoading) return;
    setSelectedTurnIndex(null);
    setViewMode("stage");
    sendWithSessionBody(promptText);
  };

  useEffect(() => {
    if (isLoading || isOpen) return;
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "assistant") return;

    const { spokenText } = parseMessagePayload(lastMessage);
    if (spokenText && lastSummonedId.current !== lastMessage.id) {
      lastSummonedId.current = lastMessage.id;
      summonSprite({
        id: lastMessage.id,
        badge: "AI Tutor",
        text: spokenText,
        position: "bottom-left",
        duration: Infinity,
      });
    }
  }, [messages, isLoading, isOpen, summonSprite]);

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsOpen(true)}
          >
            <div className="hidden sm:flex flex-col items-end rounded-2xl border border-teal-500/30 bg-slate-950/90 px-4 py-2.5 text-right shadow-xl backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                Current: {aiBrain.currentLessonTitle}
              </span>
              <span className="text-xs font-bold text-white">Open {spriteName} Assistant</span>
            </div>

            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-teal-400/50 bg-slate-900 shadow-2xl transition-transform group-hover:scale-105">
              <img
                src={avatarSrc}
                alt={spriteName}
                className="h-full w-full object-cover object-top"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 94VH DOCKED ASSISTANT DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, x: 40, y: 40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 40, y: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 right-0 z-50 flex h-[94vh] w-full sm:w-[580px] md:w-[660px] flex-col overflow-hidden rounded-tl-[36px] border-t border-l border-teal-500/30 bg-[#070B14] shadow-[-24px_-24px_80px_rgba(0,0,0,0.85)]"
            >
              {/* VECTOR ORBITS BACKGROUND */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
                viewBox="0 0 660 900"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="spoonGradWave" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.4" />
                    <stop offset="55%" stopColor="#6366F1" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity="0.08" />
                  </linearGradient>
                  <linearGradient id="spoonOrbitBright" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.65" />
                    <stop offset="50%" stopColor="#818CF8" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#C084FC" stopOpacity="0.2" />
                  </linearGradient>
                  <radialGradient id="spoonGlowOrb" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <path
                  d="M-80 190 C 160 80, 420 290, 720 130 L 720 0 L -80 0 Z"
                  fill="url(#spoonGradWave)"
                />
                <circle cx="560" cy="240" r="210" stroke="url(#spoonOrbitBright)" strokeWidth="1.75" strokeDasharray="8 8" />
                <circle cx="560" cy="240" r="145" stroke="url(#spoonOrbitBright)" strokeWidth="1.5" />
                <circle cx="560" cy="240" r="85" stroke="url(#spoonOrbitBright)" strokeWidth="1" strokeDasharray="4 6" />
                <circle cx="415" cy="240" r="5" fill="#2DD4BF" />
                <circle cx="415" cy="240" r="16" fill="url(#spoonGlowOrb)" />
                <circle cx="560" cy="385" r="4" fill="#818CF8" />
                <circle cx="90" cy="680" r="240" stroke="url(#spoonOrbitBright)" strokeWidth="1.75" />
                <circle cx="90" cy="680" r="165" stroke="url(#spoonOrbitBright)" strokeWidth="1.5" strokeDasharray="10 8" />
                <circle cx="255" cy="680" r="5" fill="#2DD4BF" />
                <circle cx="255" cy="680" r="18" fill="url(#spoonGlowOrb)" />
                <circle cx="260" cy="510" r="4" fill="#A855F7" />
              </svg>

              {/* PART 1: HEADER */}
              <SpriteChatHeader
                spriteName={spriteName}
                avatarSrc={avatarSrc}
                currentLessonTitle={aiBrain.currentLessonTitle}
                effectiveTab={effectiveTab}
                hasActiveTurns={hasActiveTurns}
                sessionsCount={sessionsList.length}
                onSelectTab={setViewMode}
                onStartNewSession={startNewSession}
                onTriggerReport={() => handleQuickPrompt("Generate my progress report")}
                onClose={() => setIsOpen(false)}
              />

              {/* PART 2: MESSAGES & STAGE */}
              <SpriteChatMessages
                effectiveTab={effectiveTab}
                spriteName={spriteName}
                avatarSrc={avatarSrc}
                aiBrain={aiBrain}
                sessionId={sessionId}
                sessionsList={sessionsList}
                turns={turns}
                currentTurnIdx={currentTurnIdx}
                activeTurn={activeTurn}
                activeAssistantPayload={activeAssistantPayload}
                isLoading={isLoading}
                error={error}
                onSelectSession={selectSession}
                onSelectTab={setViewMode}
                onSelectTurnIndex={setSelectedTurnIndex}
                onTriggerPractice={triggerPractice}
                onQuickPrompt={handleQuickPrompt}
              />

              {/* PART 3: CONTROLS / INPUT */}
              <SpriteChatControls
                input={input}
                isLoading={isLoading}
                spriteName={spriteName}
                targetLang={aiBrain.targetLang}
                onInputChange={setInput}
                onSubmit={handleSubmit}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}