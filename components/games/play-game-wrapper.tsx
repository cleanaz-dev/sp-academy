"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useSpeech } from "@/context/speech-context";

// 1. Build a Registry of all your hard-coded game engines
// Using Next.js `dynamic` means it only loads the JS for the specific game being played!
const ENGINE_REGISTRY: Record<string, React.ElementType> = {
  DUCK_A_WEAR: dynamic(() => import("./engines/duck-a-wear")),
  // Future games you build will just get added here:
  // MEMORY_MATCH: dynamic(() => import("./engines/memory-match")),
  // FLASHCARDS: dynamic(() => import("./engines/flashcards")),
};

// Hardcoded Deepgram language codes
// IMPORTANT: Change the keys on the left to match whatever format `gameVariation.language` is in your DB
const LANGUAGE_MAP: Record<string, string> = {
  English: "en-US",
  Spanish: "es",
  French: "fr",
  German: "de",
  Italian: "it",
  Portuguese: "pt",
  Dutch: "nl",
  Japanese: "ja",
  Korean: "ko",
  Chinese: "zh",
  // Add any others you need here
};

interface PlayGameWrapperProps {
  gameVariation: any; 
}

export default function PlayGameWrapper({ gameVariation }: PlayGameWrapperProps) {
  const { setLanguage } = useSpeech();

  useEffect(() => {
    // Look up the language code from the hardcoded map.
    // We provide a fallback ("en-US") just in case the language isn't found in the map.
    const sttCode = LANGUAGE_MAP[gameVariation.language] || "en-US";
    setLanguage(sttCode);
  }, [gameVariation.language, setLanguage]);

  // 2. Dynamically pick the correct engine based on the GameType from Prisma
  // (Assuming your Prisma enum `GameType` returns something like 'DUCK_A_WEAR')
  const EngineComponent = ENGINE_REGISTRY[gameVariation.game.type];

  // Fallback if someone creates a game type in DB but hasn't coded the engine yet
  if (!EngineComponent) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Error: Game Engine "{gameVariation.game.type}" not found in registry.
      </div>
    );
  }

  // 3. Render the dynamically chosen engine
  return (
    <EngineComponent 
      gameData={gameVariation.gameData[0]} 
      onGameOver={(score: number) => {
        console.log("Game Over! Score:", score);
        // Trigger server action to save score here
      }}
    />
  );
}