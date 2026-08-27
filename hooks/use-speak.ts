"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export function useSpeak() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize the audio element immediately so it's bound to the DOM
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onPlay = () => setIsPlaying(true);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
    };
  }, []);

  const speak = useCallback(
    async (
      text: string,
      targetLanguage: string,
      speed: number = 1.0,
      gender?: "male" | "female",
    ) => {
      try {
        setIsLoading(true);

        if (audioRef.current) {
          audioRef.current.pause();
        }

        // 💡 Pass gender in body (API handles undefined gracefully)
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            language: targetLanguage,
            speed,
            gender,
          }),
        });
        if (!response.ok) throw new Error("Failed to generate speech");

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.load();
          setIsLoading(false);
          // Because the Audio object already exists, mobile Safari is much
          // more likely to allow this .play() execution.
          await audioRef.current.play();
        }
      } catch (error) {
        console.error("TTS Error:", error);
        setIsLoading(false);
        setIsPlaying(false);
      }
    },
    [],
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  return { speak, stop, isPlaying, isLoading };
}
