// components/freestyle/freestyle-timer.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

interface FreestyleTimerProps {
  initialTime?: number;
  onTimeUp?: () => void;
}

export function FreestyleTimer({
  initialTime = 300,
  onTimeUp,
}: FreestyleTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasEndedRef = useRef(false);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !hasEndedRef.current) {
      hasEndedRef.current = true;
      if (onTimeUp) {
        onTimeUp();
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, onTimeUp]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium tracking-wide transition-colors ${
        timeLeft < 30
          ? "animate-pulse bg-red-50 text-red-600 font-bold"
          : "bg-slate-100 text-slate-700"
      }`}
    >
      <Clock className="h-4 w-4" />
      {formatTime(timeLeft)}
    </div>
  );
}