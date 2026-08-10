"use client";

import { PronunciationProvider } from "@/context/pronunciation-context";
import { SpeechProvider } from "@/context/speech-context"; // Adjust path as needed

export default function DailyJournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PronunciationProvider>
      <SpeechProvider>{children}</SpeechProvider>
    </PronunciationProvider>
  );
}
