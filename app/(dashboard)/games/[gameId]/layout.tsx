// app/games/[gameId]/layout.tsx
import { SpeechProvider } from "@/context/speech-context";

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <SpeechProvider>{children}</SpeechProvider>;
}