"use client";
import React from "react";
import { useWordAudio } from "@/context/word-audio-context";
import { useMatrix } from "@/context/matrix-context";

// "Excusez-moi," -> "excusez-moi", "Où" -> "où" (keeps accents, drops edge punctuation)
export const cleanWord = (s: string) =>
  s
    .toLowerCase()
    .replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")
    .trim();

type SpeakOpts = {
  track?: boolean; // count it as "heard" in the matrix (default true)
  each?: boolean; // for sentences: count every word in it instead of the whole phrase
};

/** Plays the audio AND records a "heard" in the word matrix. */
export function useSpeakWord() {
  const { playWord } = useWordAudio();
  const { trackInteraction } = useMatrix();

  return (phrase: string, opts: SpeakOpts = {}) => {
    const { track = true, each = false } = opts;
    playWord(phrase);
    if (!track) return;

    if (each) {
      phrase
        .split(/\s+/)
        .map(cleanWord)
        .filter(Boolean)
        .forEach((w) => trackInteraction(w, { heard: 1 }));
    } else {
      const key = cleanWord(phrase);
      if (key) trackInteraction(key, { heard: 1 });
    }
  };
}

/** A word you can tap to hear. Highlights while it's playing. */
export function WordTap({
  word,
  children,
  className = "",
  activeClassName = "bg-indigo-100 text-indigo-700",
  track = true,
}: {
  word: string;
  children?: React.ReactNode;
  className?: string;
  activeClassName?: string;
  track?: boolean;
}) {
  const { activeWord } = useWordAudio();
  const speak = useSpeakWord();
  const active = activeWord === word;

  return (
    <button
      type="button"
      onClick={() => speak(word, { track })}
      className={`rounded-lg transition-colors hover:bg-indigo-50 ${className} ${
        active ? activeClassName : ""
      }`}
    >
      {children ?? word}
    </button>
  );
}