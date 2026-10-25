// components/foundation/sprite-coach-pop.tsx
"use client";

import { useEffect } from "react";
import { useSprite } from "@/context/sprite-context";

const STEP_LINES: Record<
  number,
  { badge: string; vox: string[]; vivi: string[] }
> = {
  2: {
    badge: "Scene Context",
    vox: [
      "Scope out the scene first! Picturing the moment makes the words stick.",
      "Eyes on the scene—context is half the battle!",
    ],
    vivi: [
      "Let's soak in the vibe of this scene first!",
      "Picture yourself right here—it makes memory retention 2x faster.",
    ],
  },
  3: {
    badge: "Pattern Hack",
    vox: [
      "Quick pattern breakdown—no boring textbook rules, promise.",
      "Spot how these chunks lock together and you'll sound like a local.",
    ],
    vivi: [
      "Let's crack the secret pattern behind this sentence!",
      "Once you see how these pieces fit, speaking feels effortless.",
    ],
  },
  4: {
    badge: "Mic Check 🎙️",
    vox: [
      "Mic check time! Speak loud and proud—let's hear those syllables.",
      "Your turn on the mic! Don't overthink it, just flow.",
    ],
    vivi: [
      "Headphones on! Take a breath and hit the mic—you've got this!",
      "Let's hear that pronunciation! Speak clearly and have fun with it.",
    ],
  },
  5: {
    badge: "Ear Training 🎧",
    vox: [
      "Tune your ears in—catch the native rhythm and speed!",
      "Listen close! Catch the chunks you just practiced.",
    ],
    vivi: [
      "Close your eyes for a sec and just feel the melody of the phrase!",
      "Let's train your ears to catch these words at real-world speed.",
    ],
  },
  6: {
    badge: "Quick Reflex ⚡",
    vox: [
      "Show me what stuck! Quick reflex check.",
      "Light work! Lock these answers in.",
    ],
    vivi: [
      "Quick brain check! Trust your instincts on these.",
      "You already know this—let's lock it into your Matrix!",
    ],
  },
  7: {
    badge: "Final Mission 🎯",
    vox: [
      "Showtime! Step into the live roleplay and own the conversation.",
      "Final Mission! Put everything together—you're ready.",
    ],
    vivi: [
      "Final Mission time! Everything we practiced leads right here.",
      "Time for the live roleplay—jump in and impress the neighbors!",
    ],
  },
};

export function SpriteCoachPop({
  step,
  sprite,
  spriteUrl,
}: {
  step: number;
  sprite?: string;
  spriteUrl?: string;
}) {
  const { summonSprite, profile, activeSprite } = useSprite();

  useEffect(() => {
    const config = STEP_LINES[step];
    if (!config) return; // If there are no lines for this step, do nothing

    // 1. Figure out which sprite we are using (Fallback: Prop -> Profile -> Default Active)
    const resolvedSprite = sprite || profile?.sprite?.slug || activeSprite;
    const isVivi = resolvedSprite === "vivi";

    // 2. Pick a random line from the correct character's pool
    const pool = isVivi ? config.vivi : config.vox;
    const randomLine = pool[Math.floor(Math.random() * pool.length)];

    // 3. Send the message directly to the global floating SpriteContext
    summonSprite({
      id: `coach-pop-${step}`, // Unique ID prevents duplicate animations
      badge: config.badge,
      text: randomLine,
      duration: 4200,          // Auto-dismisses after 4.2 seconds
      position: "bottom-left", // Matches your original UI location
      sprite: resolvedSprite as "vox" | "vivi",
      spriteUrl: spriteUrl || profile?.sprite?.avatarUrl,
    });

  }, [step, sprite, spriteUrl, profile, activeSprite, summonSprite]);

  // We return null because the global SpriteContext (in your layout) 
  // is now handling the actual UI rendering and Framer Motion animations.
  return null;
}