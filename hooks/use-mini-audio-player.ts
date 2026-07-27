"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSignedAudioUrl } from "@/app/actions/journal-actions";

export function useMiniAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentS3Key, setCurrentS3Key] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize a single Audio element for the sidebar
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentS3Key(null);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", () => setIsPlaying(true));
      audio.removeEventListener("pause", () => setIsPlaying(false));
      audioRef.current = null;
    };
  }, []);

  const play = useCallback(async (s3Key: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    // If clicking the same track, toggle play/pause
    if (currentS3Key === s3Key) {
      if (audio.paused) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
      return;
    }

    // Load and play a new track
    setIsLoading(true);
    try {
      const res = await getSignedAudioUrl(s3Key);
      if ("error" in res) {
        console.error("Could not get audio URL:", res.error);
        return;
      }
      audio.src = res.url;
      setCurrentS3Key(s3Key);
      setProgress(0);
      await audio.play();
    } catch (err) {
      console.error("Audio playback failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentS3Key]);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentS3Key(null);
  }, []);

  return {
    isPlaying,
    isLoading,
    currentS3Key,
    progress,
    duration,
    play,
    stop,
  };
}
