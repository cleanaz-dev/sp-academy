"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FreestyleSetup from "./freestyle-setup";
import FreestyleChat from "./freestyle-chat";
import { FreestyleProvider } from "@/context/freestyle-context";
import { FreestyleReviewHub } from "./review/freestyle-review-hub";


export type FreestyleSessionConfig = {
  id: string;
  mode: string;
  topic?: string;
  nativeLanguage: string;
  targetLanguage: string;
  voiceGender: "male" | "female";
  aiAvatarUrl: string;
  level: "EASY" | "MEDIUM" | "FLUENT";
};

export default function FreestyleWrapper({ defaultNative, defaultTarget }: any) {
  const [activeSession, setActiveSession] = useState<FreestyleSessionConfig | null>(null);
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);

  const handleStartSession = async (config: Omit<FreestyleSessionConfig, "id" | "aiAvatarUrl">) => {
    const seed = Math.random().toString(36).substring(7);
    const aiAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&style=circle&top=${config.voiceGender === 'female' ? 'longHair' : 'shortHair'}`;

    const res = await fetch("/api/freestyle/create", {
      method: "POST",
      body: JSON.stringify({ ...config, aiAvatarUrl })
    });
    const data = await res.json();

    setActiveSession({
      id: data.sessionId,
      ...config,
      aiAvatarUrl,
    });
  };

  const handleEndSession = () => {
    // Capture ID before clearing session
    const endedSessionId = activeSession?.id || null;
    setActiveSession(null);
    
    // Immediately show review hub. It will poll for the review data.
    if (endedSessionId) {
      setReviewSessionId(endedSessionId);
    }
  };

  const handleReviewComplete = () => {
    // Back to setup screen
    setReviewSessionId(null);
  };

  return (
    <div className="flex-1 w-full h-full relative flex flex-col">
      <AnimatePresence mode="wait">
        {/* SETUP SCREEN */}
        {!activeSession && !reviewSessionId && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full h-full flex flex-col items-center justify-center overflow-y-auto p-6"
          >
            <div className="w-full max-w-2xl">
              <FreestyleSetup
                onStart={handleStartSession}
                defaultNative={defaultNative}
                defaultTarget={defaultTarget}
              />
            </div>
          </motion.div>
        )}

        {/* CHAT SCREEN */}
        {activeSession && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full flex flex-col"
          >
            <FreestyleProvider
              session={activeSession}
              onEnd={handleEndSession}
            >
              <FreestyleChat />
            </FreestyleProvider>
          </motion.div>
        )}

        {/* REVIEW SCREEN */}
        {reviewSessionId && (
          <motion.div
            key="review"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full flex flex-col overflow-y-auto"
          >
            <FreestyleReviewHub
              sessionId={reviewSessionId}
              onComplete={handleReviewComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}