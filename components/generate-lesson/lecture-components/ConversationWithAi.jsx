"use client";

import { useConversation } from "@11labs/react";
import { useCallback, useState } from "react";
import { Mic, MicOff, Radio, Loader2 } from "lucide-react";
import { Button } from "@/components/old-ui/button";
import { motion, AnimatePresence } from "framer-motion";

export const ConversationWithAi = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const conversation = useConversation({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (message) => console.log("Message:", message),
    onError: (error) => console.error("Error:", error),
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: "9m0ve4taM8fCaDz7O3jU",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsCompleted(true);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const getStatusIcon = () => {
    switch (conversation.status) {
      case "connected":
        return <Radio className="h-4 w-4 animate-pulse text-emerald-500" />;
      case "connecting":
        return <Loader2 className="h-4 w-4 animate-spin text-amber-500" />;
      case "disconnected":
      default:
        return <Radio className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (conversation.status) {
      case "connected":
        return "Active conversation";
      case "connecting":
        return "Establishing connection...";
      case "disconnected":
      default:
        return "Ready to start";
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-slate-50 to-blue-50 p-4 shadow-sm sm:flex-row">
      <div className="flex gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={conversation.status === "connected" ? "stop" : "start"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {conversation.status === "connected" ? (
              <Button
                type="button"
                onClick={stopConversation}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:from-red-600 hover:to-rose-700 hover:shadow-lg"
              >
                <MicOff className="h-4 w-4" />
                End Conversation
              </Button>
            ) : (
              <Button
                type="button"
                onClick={startConversation}
                disabled={conversation.status === "connecting"}
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg disabled:from-slate-400 disabled:to-slate-500"
              >
                {conversation.status === "connecting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                Try Conversation Now
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-sm">
        {getStatusIcon()}
        <span className="text-sm font-medium text-slate-700">
          {getStatusText()}
        </span>
      </div>
    </div>
  );
};
