"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { getWordAudioUrls } from "@/app/actions/word-audio";

type WordAudioMap = Record<string, { m?: string; f?: string }>;

interface WordAudioContextType {
  playWord: (word: string, gender?: "m" | "f") => Promise<void>;
  stopAudio: () => void;
  activeWord: string | null;
  isPlaying: boolean;
  targetLang: string;
}

const WordAudioContext = createContext<WordAudioContextType | null>(null);

const slug = (w: string) =>
  w
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\s-]/gu, "")
    .replace(/\s+/g, "_");

export function WordAudioProvider({
  children,
  wordAudio,
  targetLang,
}: {
  children: React.ReactNode;
  wordAudio?: WordAudioMap;
  targetLang: string;
}) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Preload audio whenever the lesson or language data changes
  useEffect(() => {
    if (!wordAudio) return;

    const keys = Object.values(wordAudio)
      .flatMap((v) => [v.m, v.f])
      .filter((k): k is string => !!k);

    if (keys.length === 0) return;

    getWordAudioUrls(keys)
      .then((newUrls) => setUrls(newUrls))
      .catch((err) => console.warn("Failed to preload word audio:", err));

    return () => {
      stopAudio();
    };
  }, [wordAudio]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setActiveWord(null);
  };

  const playWord = async (word: string, gender: "m" | "f" = "m") => {
    stopAudio();

    const normalized = slug(word);
    setActiveWord(word);
    setIsPlaying(true);

    const s3Key = `foundation/words/${targetLang}/${gender}/${normalized}.mp3`;
    const url = urls[s3Key];

    if (url) {
      // S3 audio playback
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setActiveWord(null);
      };

      audio.onerror = () => {
        fallbackTTS(word);
      };

      try {
        await audio.play();
        return;
      } catch {
        fallbackTTS(word);
      }
    } else {
      // Fallback to browser SpeechSynthesis
      fallbackTTS(word);
    }
  };

  const fallbackTTS = (word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsPlaying(false);
      setActiveWord(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = targetLang;
    utterance.onend = () => {
      setIsPlaying(false);
      setActiveWord(null);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setActiveWord(null);
    };
    window.speechSynthesis.speak(utterance);
  };

  return (
    <WordAudioContext.Provider
      value={{
        playWord,
        stopAudio,
        activeWord,
        isPlaying,
        targetLang,
      }}
    >
      {children}
    </WordAudioContext.Provider>
  );
}

export function useWordAudio() {
  const ctx = useContext(WordAudioContext);
  if (!ctx) {
    throw new Error("useWordAudio must be used within a WordAudioProvider");
  }
  return ctx;
}