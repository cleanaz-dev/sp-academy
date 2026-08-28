"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import FreestyleSetup from "./freestyle-setup";
import FreestyleChat from "./freestyle-chat";

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

  return (
    // Takes up the exact space provided by the page.tsx wrapper
    <div className="flex-1 w-full h-full relative flex flex-col">
      <AnimatePresence mode="wait">
        {!activeSession ? (
          <motion.div
            key="setup"
            // Subtle, professional fade and slide (no zooming or blurring)
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="w-full h-full flex flex-col items-center justify-center overflow-y-auto p-6"
          >
            <div className="w-full max-w-2xl">
              <h1 className="text-2xl font-semibold mb-8 text-slate-800 text-center">
                Start a Freestyle Session
              </h1>
              <FreestyleSetup
                onStart={handleStartSession}
                defaultNative={defaultNative}
                defaultTarget={defaultTarget}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            // Full bleed—forces the chat to touch the edges of the parent layout
            className="w-full h-full flex flex-col"
          >
            <FreestyleChat
              session={activeSession}
              onEnd={() => setActiveSession(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}