// hooks/use-review-pusher.ts
"use client"
import { useEffect } from "react";
import Pusher from "pusher-js";
import { toast } from "sonner";

export function useReviewPusher(
  sessionId: string | null,
  onReviewReady: (sessionId: string) => void,
  onReviewFailed: () => void // 👈 Add a failure callback
) {
  useEffect(() => {
    if (!sessionId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channelName = `session-${sessionId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("review:completed", (data: { sessionId: string; status: string }) => {
      console.log("Pusher event received!", data);
      
      if (data.status === "SUCCESS") {
        onReviewReady(data.sessionId);
      } else {
        // Break out of the loading screen
        toast.error("Review Failed", {
          description: "Something went wrong generating your AI review."
        });
        onReviewFailed(); 
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
    };
  }, [sessionId, onReviewReady, onReviewFailed]);
}