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
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audioRef.current = null;
    };
  }, []);

  const play = useCallback(async (s3Key: string) => {
    const audio = audioRef.current;
    if (!audio || !s3Key) return;

    if (currentS3Key === s3Key && audio.src) {
      if (audio.paused) {
        audio.play().catch(console.error);
      } else {
        audio.pause();
      }
      return;
    }

    setIsLoading(true);
    try {
      const res = await getSignedAudioUrl(s3Key);
      if (!res || "error" in res) {
        console.error("Could not get audio URL:", res && "error" in res ? res.error : "no response");
        return;
      }
      audio.pause();
      audio.src = res.url;
      audio.load();
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