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
    // 1. Generate a premium random avatar based on gender
    const seed = Math.random().toString(36).substring(7);
    const aiAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&style=circle&top=${config.voiceGender === 'female' ? 'longHair' : 'shortHair'}`;

    // 2. Create the session in the database
    const res = await fetch("/api/freestyle/create", {
      method: "POST",
      body: JSON.stringify({ ...config, aiAvatarUrl })
    });
    const data = await res.json();

    // 3. Instantly swap the UI to the chat (No router.push delays!)
    setActiveSession({
      id: data.sessionId, // Returned from your DB
      ...config,
      aiAvatarUrl,
    });
  };

  return (
    <div className="w-full h-[85vh] relative flex flex-col justify-center">
      <AnimatePresence mode="wait">
        {!activeSession ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl mx-auto"
          >
            <FreestyleSetup
              onStart={handleStartSession}
              defaultNative={defaultNative}
              defaultTarget={defaultTarget}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-4xl mx-auto h-full"
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