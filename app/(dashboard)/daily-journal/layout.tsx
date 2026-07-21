"use client";

import { SpeechProvider } from "@/context/speech-context"; // Adjust path as needed

export default function DailyJournalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SpeechProvider>{children}</SpeechProvider>;
}