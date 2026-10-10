"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { getWordAudioUrls } from "@/app/actions/word-audio";

type WordAudioMap = Record<string, { m?: string; f?: string }>;

interface WordAudioContextType {
  playWord: (phrase: string, gender?: "m" | "f") => Promise<void>;
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
  const playTokenRef = useRef(0); // invalidates in-flight sequences

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordAudio]);

  const stopAudio = () => {
    playTokenRef.current++;
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

  // Resolves true if the clip played to the end, false on error
  const playUrl = (url: string) =>
    new Promise<boolean>((resolve) => {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => resolve(true);
      audio.onerror = () => resolve(false);
      audio.play().catch(() => resolve(false));
    });

  const fallbackTTS = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setIsPlaying(false);
      setActiveWord(null);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
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

  const playWord = async (phrase: string, gender: "m" | "f" = "m") => {
    stopAudio();
    const token = playTokenRef.current;

    setActiveWord(phrase);
    setIsPlaying(true);

    // "le voisin" -> ["le", "voisin"], "t'appelle" -> ["tappelle"]
    const tokens = phrase.split(/\s+/).map(slug).filter(Boolean);
    const keys = tokens.map(
      (t) => `foundation/words/${targetLang}/${gender}/${t}.mp3`
    );

    // Only use recorded audio if EVERY token has a file
    if (keys.length > 0 && keys.every((k) => urls[k])) {
      for (const key of keys) {
        if (token !== playTokenRef.current) return; // cancelled
        const ok = await playUrl(urls[key]);
        if (!ok) {
          if (token === playTokenRef.current) fallbackTTS(phrase);
          return;
        }
      }
      if (token === playTokenRef.current) {
        setIsPlaying(false);
        setActiveWord(null);
      }
      return;
    }

    fallbackTTS(phrase);
  };

  return (
    <WordAudioContext.Provider
      value={{ playWord, stopAudio, activeWord, isPlaying, targetLang }}
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