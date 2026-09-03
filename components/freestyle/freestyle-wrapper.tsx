"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import FreestyleSetup from "./freestyle-setup";
import FreestyleChat from "./freestyle-chat";
import { FreestyleProvider } from "@/context/freestyle-context";
import { FreestyleReviewHub } from "./review/freestyle-review-hub";
import { useReviewPusher } from "@/hooks/use-review-pusher"; 

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
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null); 
  const [reviewSessionId, setReviewSessionId] = useState<string | null>(null);

// 🚨 Listen for Pusher event when a review is pending
  const handleReviewReady = useCallback((id: string) => {
    setPendingReviewId(null);
    setReviewSessionId(id);
  }, []);

  // NEW: Handle failure so the user doesn't get stuck on the loading screen
  const handleReviewFailed = useCallback(() => {
    setPendingReviewId(null); // Drops them back to the Setup screen
    setReviewSessionId(null);
  }, []);

  // Pass both success and failure handlers to the hook
  // useReviewPusher(pendingReviewId, handleReviewReady, handleReviewFailed);


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
    const endedSessionId = activeSession?.id || null;
    setActiveSession(null);
    
    // Instead of going straight to the review hub, we enter the "Waiting" phase
    if (endedSessionId) {
      setPendingReviewId(endedSessionId);
    }
  };

  const handleReviewComplete = () => {
    // Review is over, return to Setup
    setReviewSessionId(null);
  };

  return (
    <div className="flex-1 w-full h-full relative flex flex-col bg-gray-50/50">
      <AnimatePresence mode="wait">
        
        {/* 1. SETUP SCREEN */}
        {!activeSession && !pendingReviewId && !reviewSessionId && (
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

        {/* 2. CHAT SCREEN */}
        {activeSession && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full flex flex-col"
          >
            <FreestyleProvider session={activeSession} onEnd={handleEndSession}>
              <FreestyleChat />
            </FreestyleProvider>
          </motion.div>
        )}

        {/* 3. NEW: ANALYZING / WAITING SCREEN */}
        {pendingReviewId && (
          <motion.div
            key="pending"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-sm w-full space-y-6">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🧠</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Analyzing Session</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Your AI tutor is reviewing your grammar, vocabulary, and pronunciation. Give us just a moment...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4. REVIEW SCREEN */}
        {reviewSessionId && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full flex flex-col overflow-y-auto"
          >
            {/* Note: FreestyleReviewHub no longer needs to poll, because Pusher told us it's ready! */}
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