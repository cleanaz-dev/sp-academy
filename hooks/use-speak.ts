// hooks/use-speak.ts
"use client";

import { useState, useRef, useCallback } from "react";

export function useSpeak() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Added speed parameter with a default of 1.0
  const speak = useCallback(async (text: string, targetLanguage: string, speed: number = 1.0) => {
    try {
      setIsLoading(true);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Pass the speed parameter in the body
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: targetLanguage, speed }),
      });

      if (!response.ok) throw new Error("Failed to generate speech");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl); // cleanup
      };

      audio.onplay = () => setIsPlaying(true);
      
      setIsLoading(false);
      await audio.play();
      
    } catch (error) {
      console.error("TTS Error:", error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { speak, stop, isPlaying, isLoading };
}