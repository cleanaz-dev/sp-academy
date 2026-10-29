// components/sprite/sprite-chat.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion, AnimatePresence } from "framer-motion";
import { useSprite } from "@/context/sprite-context";
import { SpriteChatHeader } from "./sprite-chat-header";
import { SpriteChatMessages } from "./sprite-chat-messages";
import { SpriteChatControls } from "./sprite-chat-controls";
import {
  cleanDisplayString,
  parseMessagePayload,
  turnsToUIMessages,
  groupUIMessagesIntoTurns,
  type ChatContextData,
} from "./sprite-chat-utils";
import type { SpriteSessionData } from "@/lib/schema/sprite-schema";

export type { ChatContextData } from "./sprite-chat-utils";

interface SpriteChatProps {
  userId: string;
  initialContext?: ChatContextData;
}

export function SpriteChat({ userId, initialContext }: SpriteChatProps) {
  const {
    profile,
    spriteName,
    avatarSrc,
    isChatOpen,
    openChat,
    closeChat,
    activeTab,
    setActiveTab,
    viewMode,
    setViewMode,
    unreadCount,
    pendingPrompt,
    clearPendingPrompt,
    deleteSession,
  } = useSprite();

  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [sessionsList, setSessionsList] = useState<SpriteSessionData[]>([]);
  const [selectedTurnIndex, setSelectedTurnIndex] = useState<number | null>(
    null,
  );
  const [input, setInput] = useState("");

  const lastUserPromptRef = useRef<string>("");

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

  const sessionRef = useRef({
    sessionId,
    lessonTitle: aiBrain.currentLessonTitle,
    spriteName,
    dossier: apiDossier,
  });
  sessionRef.current = {
    sessionId,
    lessonTitle: aiBrain.currentLessonTitle,
    spriteName,
    dossier: apiDossier,
  };

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/users/${userId}/sprite/sessions`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.sessions)) {
        setSessionsList(data.sessions);
      }
    } catch (e) {
      console.error("Failed to fetch sprite sessions:", e);
    }
  }, [userId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `/api/users/${userId}/sprite/chat`,
      }),
    [userId],
  );

  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport,
    onFinish: async ({ message }) => {
      if (message.role !== "assistant") return;
      const parsed = parseMessagePayload(message);
      const turnPayload = {
        id: message.id || crypto.randomUUID(),
        userPrompt: cleanDisplayString(lastUserPromptRef.current || "Practice"),
        assistantReply: parsed.spokenText || "Let's continue practicing.",
        isTranslationRequired: parsed.isTranslationRequired,
        translation: parsed.translation ?? null,
        contextCard: parsed.contextCard ?? null,
        action: parsed.action ?? null,
        createdAt: new Date().toISOString(),
      };

      try {
        const res = await fetch(`/api/users/${userId}/sprite/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionRef.current.sessionId,
            lessonTitle: sessionRef.current.lessonTitle,
            turn: turnPayload,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sessions)) {
            setSessionsList(data.sessions);
          }
        } else {
          await fetchSessions();
        }
      } catch (err) {
        console.error("Failed to persist turn:", err);
      }
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  const sendWithSessionBody = useCallback(
    (text: string) => {
      lastUserPromptRef.current = text;
      sendMessage(
        { text },
        {
          body: {
            sessionId: sessionRef.current.sessionId,
            spriteName: sessionRef.current.spriteName,
            dossier: sessionRef.current.dossier,
          },
        },
      );
    },
    [sendMessage],
  );

  const handleQuickPrompt = useCallback(
    (promptText: string) => {
      if (isLoading) return;
      setSelectedTurnIndex(null);
      setActiveTab("session");
      sendWithSessionBody(promptText);
    },
    [isLoading, setActiveTab, sendWithSessionBody],
  );

  // Fire any prompt queued via openChat({ prompt: "..." })
  useEffect(() => {
    if (isChatOpen && pendingPrompt && !isLoading) {
      handleQuickPrompt(pendingPrompt);
      clearPendingPrompt();
    }
  }, [isChatOpen, pendingPrompt, isLoading, handleQuickPrompt, clearPendingPrompt]);

  const turns = useMemo(() => groupUIMessagesIntoTurns(messages), [messages]);

  const currentTurnIdx =
    selectedTurnIndex !== null && turns[selectedTurnIndex]
      ? selectedTurnIndex
      : Math.max(0, turns.length - 1);

  const activeTurn = turns[currentTurnIdx];

  const activeAssistantPayload = useMemo(
    () => parseMessagePayload(activeTurn?.assistantMessage),
    [activeTurn?.assistantMessage],
  );

  useEffect(() => {
    if (isChatOpen) {
      fetchSessions();
    }
  }, [isChatOpen, fetchSessions]);

  const startNewSession = () => {
    setSessionId(crypto.randomUUID());
    setMessages([]);
    setSelectedTurnIndex(null);
    setActiveTab("session");
  };

  const selectSession = (session: SpriteSessionData) => {
    setSessionId(session.id);
    const loadedMessages = turnsToUIMessages(session.turns || []);
    setMessages(loadedMessages);
    setSelectedTurnIndex(null);
    setActiveTab("session");
  };

  const handleDeleteSession = async (
    session: SpriteSessionData,
  ): Promise<boolean> => {
    const ok = await deleteSession(session.id);
    if (!ok) return false;

    setSessionsList((prev) => prev.filter((s) => s.id !== session.id));

    if (session.id === sessionId) {
      setSessionId(crypto.randomUUID());
      setMessages([]);
      setSelectedTurnIndex(null);
    }

    return true;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setSelectedTurnIndex(null);
    setActiveTab("session");
    sendWithSessionBody(text);
    setInput("");
  };

  const triggerPractice = (word: string) => {
    if (isLoading) return;
    setSelectedTurnIndex(null);
    setActiveTab("session");
    sendWithSessionBody(`Help me practice how to use "${word}"`);
  };

  return (
    <>
      {/* FLOATING TRIGGER BUTTON */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-3 cursor-pointer group"
            onClick={() => openChat()}
          >
            <div className="hidden sm:flex flex-col items-end rounded-2xl border border-teal-500/30 bg-slate-950/90 px-4 py-2.5 text-right shadow-xl backdrop-blur-md">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
                Current: {aiBrain.currentLessonTitle}
              </span>
              <span className="text-xs font-bold text-white">
                Open {spriteName} Assistant
              </span>
            </div>

            <div className="relative h-14 w-14">
              <div className="h-full w-full overflow-hidden rounded-2xl border-2 border-teal-400/50 bg-slate-900 shadow-2xl transition-transform group-hover:scale-105">
                <img
                  src={avatarSrc}
                  alt={spriteName}
                  className="h-full w-full object-cover object-top"
                />
              </div>

              {/* Unread Sprite Notification Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-slate-950 shadow-md">
                  {unreadCount}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL HEIGHT (100VH) DOCKED ASSISTANT DRAWER */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeChat}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 bottom-0 right-0 z-50 flex h-screen w-full sm:w-[580px] md:w-[660px] flex-col overflow-hidden border-l border-teal-500/30 bg-[#070B14] shadow-[-24px_0_80px_rgba(0,0,0,0.85)]"
            >
              {/* VECTOR ORBITS BACKGROUND */}
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full opacity-55"
                viewBox="0 0 660 900"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="spoonGradWave"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.4" />
                    <stop offset="55%" stopColor="#6366F1" stopOpacity="0.28" />
                    <stop
                      offset="100%"
                      stopColor="#A855F7"
                      stopOpacity="0.08"
                    />
                  </linearGradient>
                  <linearGradient
                    id="spoonOrbitBright"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
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
                <circle
                  cx="560"
                  cy="240"
                  r="210"
                  stroke="url(#spoonOrbitBright)"
                  strokeWidth="1.75"
                  strokeDasharray="8 8"
                />
                <circle
                  cx="560"
                  cy="240"
                  r="145"
                  stroke="url(#spoonOrbitBright)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="560"
                  cy="240"
                  r="85"
                  stroke="url(#spoonOrbitBright)"
                  strokeWidth="1"
                  strokeDasharray="4 6"
                />
                <circle cx="415" cy="240" r="5" fill="#2DD4BF" />
                <circle cx="415" cy="240" r="16" fill="url(#spoonGlowOrb)" />
                <circle cx="560" cy="385" r="4" fill="#818CF8" />
                <circle
                  cx="90"
                  cy="680"
                  r="240"
                  stroke="url(#spoonOrbitBright)"
                  strokeWidth="1.75"
                />
                <circle
                  cx="90"
                  cy="680"
                  r="165"
                  stroke="url(#spoonOrbitBright)"
                  strokeWidth="1.5"
                  strokeDasharray="10 8"
                />
                <circle cx="255" cy="680" r="5" fill="#2DD4BF" />
                <circle cx="255" cy="680" r="18" fill="url(#spoonGlowOrb)" />
                <circle cx="260" cy="510" r="4" fill="#A855F7" />
              </svg>

              {/* PART 1: HEADER */}
              <SpriteChatHeader
                spriteName={spriteName}
                avatarSrc={avatarSrc}
                currentLessonTitle={aiBrain.currentLessonTitle}
                activeTab={activeTab}
                sessionsCount={sessionsList.length}
                onSelectTab={setActiveTab}
                onStartNewSession={startNewSession}
                onClose={closeChat}
                viewMode={viewMode}
                onChangeViewMode={(mode) => {
                  setViewMode(mode);
                  if (activeTab !== "session") setActiveTab("session");
                }}
              />

              {/* PART 2: MESSAGES / STAGE / BRIEFING / HISTORY */}
              <SpriteChatMessages
                activeTab={activeTab}
                viewMode={viewMode}
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
                onSelectTurnIndex={setSelectedTurnIndex}
                onTriggerPractice={triggerPractice}
                onQuickPrompt={handleQuickPrompt}
                onDeleteSession={handleDeleteSession}
              />

              {/* PART 3: CONTROLS / INPUT (ONLY RENDERED INSIDE THE SESSION TAB) */}
              {activeTab === "session" && (
                <SpriteChatControls
                  input={input}
                  isLoading={isLoading}
                  spriteName={spriteName}
                  targetLang={aiBrain.targetLang}
                  onInputChange={setInput}
                  onSubmit={handleSubmit}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}