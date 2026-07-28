"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useListen(audioUrl?: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1.0);

  // Initialize the audio element and its event listeners
  useEffect(() => {
    if (typeof window === "undefined" || !audioUrl) return;

    // Create a new HTML5 Audio object (this preloads the audio in the background automatically!)
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    // Reset states when a new URL loads
    setIsPlaying(false);
    setIsEnded(false);
    setProgress(0);
    audio.playbackRate = playbackRate;

    // Event Handlers
    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setProgress((audio.currentTime / audio.duration) * 100);
    const onPlay = () => { setIsPlaying(true); setIsEnded(false); };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); setIsEnded(true); };

    // Attach Listeners
    audio.addEventListener("loadedmetadata", setAudioData);
    audio.addEventListener("timeupdate", setAudioTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    // Cleanup when component unmounts or audioUrl changes
    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData);
      audio.removeEventListener("timeupdate", setAudioTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = ""; // Free up memory
    };
  }, [audioUrl]);

  // --- CONTROLS ---

  const play = useCallback(() => {
    if (audioRef.current) {
      // If it previously ended, reset to the beginning before playing
      if (audioRef.current.currentTime === audioRef.current.duration) {
        audioRef.current.currentTime = 0;
      }
      audioRef.current.play().catch((err) => console.error("Audio playback failed:", err));
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const togglePlay = useCallback(() => {
    isPlaying ? pause() : play();
  }, [isPlaying, pause, play]);

  // The "Turtle Mode" controller
  const setPlaybackRate = useCallback((rate: number) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      // Many browsers support this to keep the voice pitch normal even when slowed down
      audioRef.current.preservesPitch = true; 
    }
    setPlaybackRateState(rate);
  }, []);

  return {
    isPlaying,
    isEnded,
    progress,
    duration,
    playbackRate,
    play,
    pause,
    stop,
    togglePlay,
    setPlaybackRate,
  };
}