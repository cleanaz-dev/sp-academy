"use client";

import React, { createContext, useContext, useRef } from "react";

// The exact structure Zod is expecting on your backend
export type Interaction = {
  word: string;
  seen: number;
  heard: number; // <-- ADDED
  tappedCorrect: number;
  tappedWrong: number;
  spokenAttempt: boolean;
  spokenScore?: number;
};

type MatrixContextType = {
  // Call this when a user clicks/speaks a word
  trackInteraction: (
    word: string,
    data: Partial<Omit<Interaction, "word">>,
  ) => void;
  // Call this when they hit "Next"
  syncCart: (userId: string, targetLang: string) => Promise<void>;
};

const MatrixContext = createContext<MatrixContextType | null>(null);

export function MatrixProvider({ children }: { children: React.ReactNode }) {
  // We use a ref so tracking clicks DOES NOT re-render the app!
  const cartRef = useRef<Record<string, Interaction>>({});

  const trackInteraction = (
    word: string,
    data: Partial<Omit<Interaction, "word">>,
  ) => {
    // If the word isn't in the cart yet, initialize it
    if (!cartRef.current[word]) {
      cartRef.current[word] = {
        word: word,
        seen: 0,
        heard: 0,
        tappedCorrect: 0,
        tappedWrong: 0,
        spokenAttempt: false,
      };
    }

    // Update the values
    const current = cartRef.current[word];
    if (data.seen) current.seen += data.seen;
    if (data.heard) current.heard += data.heard;
    if (data.tappedCorrect) current.tappedCorrect += data.tappedCorrect;
    if (data.tappedWrong) current.tappedWrong += data.tappedWrong;
    if (data.spokenAttempt) current.spokenAttempt = true;
    if (data.spokenScore !== undefined) current.spokenScore = data.spokenScore;
  };

  const syncCart = async (userId: string, targetLang: string) => {
    const interactions = Object.values(cartRef.current);
    if (interactions.length === 0) return; // Nothing to save

    // 1. Copy the payload
    const payload = { interactions };

    // 2. CLEAR THE CART IMMEDIATELY for the next step!
    cartRef.current = {};

    // 3. Fire and forget to your Next.js API (don't await it to block the UI)
    fetch(`/api/users/${userId}/matrix/${targetLang}/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch((err) => console.error("Matrix Sync Failed:", err));
  };

  return (
    <MatrixContext.Provider value={{ trackInteraction, syncCart }}>
      {children}
    </MatrixContext.Provider>
  );
}

export const useMatrix = () => {
  const ctx = useContext(MatrixContext);
  if (!ctx) throw new Error("useMatrix must be used within MatrixProvider");
  return ctx;
};