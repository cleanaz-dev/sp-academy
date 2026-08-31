"use client";

import { useState, useCallback, useRef } from "react";

export function useReviewTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    async (text: string, language?: string, onDone?: () => void) => {
      setIsSpeaking(true);
      try {
        const res = await fetch("/api/fish-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language }),
        });

        if (!res.ok) throw new Error("TTS request failed");

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          onDone?.();
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          onDone?.();
        };

        await audio.play();
      } catch (err) {
        console.error("TTS error:", err);
        setIsSpeaking(false);
        onDone?.();
      }
    },
    []
  );

  const stop = useCallback(() => {
    audioRef.current?.pause();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop };
}