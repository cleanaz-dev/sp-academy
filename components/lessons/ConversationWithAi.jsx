"use client";

import { useConversation } from "@11labs/react";
import { useCallback, useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "../ui/button";

export default function ConversationWithAi() {
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

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={startConversation}
        disabled={conversation.status === "connected"}
        className="flex items-center gap-1 rounded-full bg-blue-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300"
      >
        <Mic className="h-4 w-4" />
        Try Conversation Now
      </Button>
      <Button
        type="button"
        onClick={stopConversation}
        disabled={conversation.status !== "connected"}
        className="rounded-full bg-red-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-600 disabled:bg-gray-300"
      >
        Stop
      </Button>
      <div className="text-sm text-muted-foreground">
        Status: {conversation.status}
      </div>
    </div>
  );
}
