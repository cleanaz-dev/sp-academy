"use client";

import { useCallback, useEffect, useRef } from "react";

export function useAudio() {
  const audioRef = useRef({}); // Store audio instances by URL

  // Preload an audio file
  const preload = useCallback((url) => {
    if (!url) return;
    if (!audioRef.current[url]) {
      audioRef.current[url] = new Audio(url);
      audioRef.current[url].preload = "auto"; // Preload the audio
    }
  }, []);

  // Play an audio file
  const play = useCallback((url) => {
    if (!url) return;

    // If audio isn't preloaded yet, create it
    if (!audioRef.current[url]) {
      audioRef.current[url] = new Audio(url);
    }

    // Reset the audio to the start and play
    const audio = audioRef.current[url];
    audio.currentTime = 0; // Rewind to start in case it's already played
    audio.play().catch((error) => {
      console.error("Audio playback failed:", error);
    });
  }, []);

  // Cleanup audio instances when component unmounts
  useEffect(() => {
    return () => {
      // Stop and clean up all audio instances
      Object.values(audioRef.current).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioRef.current = {};
    };
  }, []);

  return { play, preload };
}
