// sprite-coach-pop.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

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
  const [visible, setVisible] = useState(false);
  const [line, setLine] = useState("");
  const [badge, setBadge] = useState("");

const isVivi = sprite === "vivi";
const spriteName = isVivi ? "Vivi" : "Vox";
const avatarSrc = spriteUrl || (isVivi ? "/sprite-f.png" : "/sprite-m.png");


  useEffect(() => {
    const config = STEP_LINES[step];
    if (!config) {
      setVisible(false);
      return;
    }

    const pool = isVivi ? config.vivi : config.vox;
    setLine(pool[Math.floor(Math.random() * pool.length)]);
    setBadge(config.badge);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
    }, 4200);

    return () => clearTimeout(timer);
  }, [step, isVivi]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`coach-pop-${step}`}
          initial={{ opacity: 0, y: 20, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 360, damping: 26 }}
          className="fixed bottom-6 left-6 z-50 flex max-w-xs sm:max-w-sm items-center gap-3.5 rounded-3xl border border-indigo-500/30 bg-slate-950/95 p-3.5 text-white shadow-2xl shadow-indigo-950/40 backdrop-blur-xl"
        >
          {/* Sprite Avatar with Glow */}
          <div className="relative shrink-0">
            <span className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-teal-400 via-indigo-500 to-fuchsia-500 opacity-60 blur-xs" />
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/20 bg-slate-900">
              <img
                src={avatarSrc}
                alt={spriteName}
                className="h-full w-full object-cover object-top"
              />
            </div>
          </div>

          {/* Speech Content */}
          <div className="flex-1 pr-1">
            <div className="mb-1 flex items-center gap-1.5">
              <span className="rounded-full bg-teal-400/20 px-2 py-0.5 text-[10px] font-black tracking-wider text-teal-300 uppercase">
                {spriteName}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold tracking-wide text-indigo-300 uppercase">
                <Sparkles className="h-2.5 w-2.5" />
                {badge}
              </span>
            </div>
            <p className="text-xs leading-relaxed font-semibold text-slate-100">
              &ldquo;{line}&rdquo;
            </p>
          </div>

          {/* Dismiss X */}
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="self-start rounded-full p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}