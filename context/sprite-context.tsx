// context/sprite-context.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Volume2,
  Square,
  X,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { getPresignedUrls } from "@/app/actions/s3";
import type { SpriteAIContext } from "@/app/actions/compute-sprite-context";

export type SpriteType = "vox" | "vivi";

export type SpriteAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "danger" | "retry";
};

export type SpritePayload = {
  id?: string;
  badge?: string;
  text: string;
  audioUrl?: string | null;
  autoPlayAudio?: boolean;
  sprite?: SpriteType;
  spriteUrl?: string;
  duration?: number; // ms, pass Infinity to stay until closed/clicked
  position?: "bottom-left" | "bottom-right" | "top-right";
  action?: SpriteAction;
};

// Matches what getUserSprite(userId) returns: SpriteProfile + its Sprite
export type SpriteProfileData = {
  id: string;
  userId: string; // <--- NEW: needed for /api/users/[userId]/sprite/... calls
  nativeLanguage: string;
  targetLanguage: string;
  nativeVoiceId: string;
  targetVoiceId: string;
  context: SpriteAIContext | null;
  sprite: {
    slug: string;
    name: string;
    avatarUrl: string;
    moodUrls: string[];
    persona: string | null;
  };
} | null;

interface SpriteContextValue {
  activeSprite: SpriteType;
  setActiveSprite: (sprite: SpriteType) => void;
  summonSprite: (payload: SpritePayload) => void;
  dismissSprite: () => void;
  /** Deletes a saved chat session. Resolves true on success, false on failure. */
  deleteSession: (sessionId: string) => Promise<boolean>;
  isShowing: boolean;
  profile: SpriteProfileData; // id, voice IDs, languages, sprite (name/avatar/persona)
}

const SpriteContext = createContext<SpriteContextValue | null>(null);

export function SpriteProvider({
  children,
  spriteData = null,
}: {
  children: React.ReactNode;
  spriteData?: SpriteProfileData;
}) {
  const dbSprite = spriteData?.sprite ?? null;
  const userId = spriteData?.userId ?? null;

  const [activeSprite, setActiveSprite] = useState<SpriteType>(
    (dbSprite?.slug as SpriteType) ?? "vox"
  );
  const [current, setCurrent] = useState<SpritePayload | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const s3CacheRef = useRef<Record<string, string>>({});

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const dismissSprite = useCallback(() => {
    stopAudio();
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(null);
  }, [stopAudio]);

  const resolvePlayableUrl = useCallback(async (urlOrKey: string) => {
    if (
      urlOrKey.startsWith("http://") ||
      urlOrKey.startsWith("https://") ||
      urlOrKey.startsWith("/")
    ) {
      return urlOrKey;
    }

    if (s3CacheRef.current[urlOrKey]) {
      return s3CacheRef.current[urlOrKey];
    }

    try {
      const signed = await getPresignedUrls([urlOrKey]);
      if (signed?.[urlOrKey]) {
        s3CacheRef.current[urlOrKey] = signed[urlOrKey];
        return signed[urlOrKey];
      }
    } catch (err) {
      console.warn("Failed to resolve S3 key for sprite audio:", err);
    }

    return null;
  }, []);

  const playAudioUrl = useCallback(
    async (urlOrKey: string) => {
      stopAudio();
      const playableUrl = await resolvePlayableUrl(urlOrKey);
      if (!playableUrl) return;

      const audio = new Audio(playableUrl);
      audioRef.current = audio;
      setIsPlaying(true);

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.play().catch((err) => {
        console.warn("Sprite audio autoplay blocked or failed:", err);
        setIsPlaying(false);
      });
    },
    [stopAudio, resolvePlayableUrl]
  );

  const summonSprite = useCallback(
    (payload: SpritePayload) => {
      stopAudio();
      if (timerRef.current) clearTimeout(timerRef.current);

      const nextPayload: SpritePayload = {
        id: payload.id || String(Date.now()),
        duration: payload.duration ?? 5000,
        position: payload.position ?? "bottom-left",
        ...payload,
      };

      setCurrent(nextPayload);

      if (nextPayload.audioUrl && nextPayload.autoPlayAudio) {
        playAudioUrl(nextPayload.audioUrl);
      }

      if (nextPayload.duration && nextPayload.duration !== Infinity) {
        timerRef.current = setTimeout(() => {
          setCurrent(null);
        }, nextPayload.duration);
      }
    },
    [playAudioUrl, stopAudio]
  );

  // DELETE /api/users/[userId]/sprite/sessions/[sessionId]
  // A 404 counts as success: the session is already gone, which is what the user wanted.
  const deleteSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      if (!userId) return false;

      try {
        const res = await fetch(
          `/api/users/${userId}/sprite/sessions/${sessionId}`,
          { method: "DELETE" }
        );
        return res.ok || res.status === 404;
      } catch (err) {
        console.error("Failed to delete sprite session:", err);
        return false;
      }
    },
    [userId]
  );

  useEffect(() => {
    return () => {
      stopAudio();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stopAudio]);

  // Sprite identity now comes from the DB (via layout), with the old hardcoded values as fallback
  const resolvedSprite = current?.sprite || activeSprite;
  const isVivi = resolvedSprite === "vivi";
  const spriteName = dbSprite?.name ?? (isVivi ? "Vivi" : "Vox");
  const avatarSrc =
    current?.spriteUrl ||
    dbSprite?.avatarUrl ||
    (isVivi ? "/sprite-f.png" : "/sprite-m.png");

  const positionClasses =
    current?.position === "bottom-right"
      ? "bottom-6 right-6"
      : current?.position === "top-right"
        ? "top-6 right-6"
        : "bottom-6 left-6";

  return (
    <SpriteContext.Provider
      value={{
        activeSprite,
        setActiveSprite,
        summonSprite,
        dismissSprite,
        deleteSession,
        isShowing: !!current,
        profile: spriteData,
      }}
    >
      {children}

      {/* GLOBAL FLOATING SPRITE HUD */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className={`fixed ${positionClasses} z-50 flex w-[92vw] max-w-sm items-start gap-3.5 rounded-3xl border border-indigo-500/30 bg-slate-950/95 p-4 text-white shadow-2xl shadow-indigo-950/50 backdrop-blur-xl`}
          >
            {/* Avatar + Speaking Aura */}
            <div className="relative shrink-0">
              <span
                className={`absolute -inset-1 rounded-2xl bg-gradient-to-tr from-teal-400 via-indigo-500 to-fuchsia-500 blur-xs transition-opacity ${
                  isPlaying ? "animate-pulse opacity-85" : "opacity-50"
                }`}
              />
              <motion.div
                animate={
                  isPlaying
                    ? { y: [0, -3, 0], scale: [1, 1.04, 1] }
                    : { y: 0, scale: 1 }
                }
                transition={{
                  repeat: isPlaying ? Infinity : 0,
                  duration: 1.2,
                  ease: "easeInOut",
                }}
                className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-slate-900"
              >
                <img
                  src={avatarSrc}
                  alt={spriteName}
                  className="h-full w-full object-cover object-top"
                />
              </motion.div>
            </div>

            {/* Bubble Content */}
            <div className="flex-1 min-w-0">
              {/* Top Meta Row */}
              <div className="mb-1 flex items-center gap-1.5">
                <span className="rounded-full bg-teal-400/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-teal-300 uppercase">
                  {spriteName}
                </span>
                {current.badge && (
                  <span className="inline-flex items-center gap-1 truncate text-[10px] font-extrabold tracking-wide text-indigo-300 uppercase">
                    <Sparkles className="h-2.5 w-2.5 shrink-0" />
                    {current.badge}
                  </span>
                )}
              </div>

              {/* Main Message */}
              <p className="text-xs leading-relaxed font-semibold text-slate-100">
                &ldquo;{current.text}&rdquo;
              </p>

              {/* Optional Audio & Action Controls Row */}
              {(current.audioUrl || current.action) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {current.audioUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        isPlaying
                          ? stopAudio()
                          : playAudioUrl(current.audioUrl!)
                      }
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold transition ${
                        isPlaying
                          ? "bg-teal-500 text-slate-950"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="h-2.5 w-2.5 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-3 w-3" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  )}

                  {current.action && (
                    <button
                      type="button"
                      onClick={() => {
                        current.action?.onClick();
                        dismissSprite();
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-extrabold transition active:scale-95 ${
                        current.action.variant === "danger" ||
                        current.action.variant === "retry"
                          ? "bg-rose-500 text-white hover:bg-rose-400"
                          : "bg-indigo-500 text-white hover:bg-indigo-400"
                      }`}
                    >
                      {current.action.variant === "retry" && (
                        <RotateCcw className="h-3 w-3" />
                      )}
                      <span>{current.action.label}</span>
                      {current.action.variant !== "retry" && (
                        <ArrowRight className="h-3 w-3" />
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={dismissSprite}
              className="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </SpriteContext.Provider>
  );
}

export function useSprite() {
  const ctx = useContext(SpriteContext);
  if (!ctx) {
    throw new Error("useSprite must be used within a <SpriteProvider>");
  }
  return ctx;
}