"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  x?: number;
  y?: number;
  scale?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
};

export function Reveal({
  children,
  delay = 0,
  x = 0,
  y = 24,
  scale = 1,
  className,
  as = "div",
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={
        reduceMotion
          ? { opacity: 0 }
          : {
              opacity: 0,
              x,
              y,
              scale,
            }
      }
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
      }}
      viewport={{
        once: true,
        margin: "-80px",
      }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}