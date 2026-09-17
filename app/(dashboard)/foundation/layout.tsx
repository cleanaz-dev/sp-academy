import { PronunciationProvider } from "@/context/pronunciation-context";
import { SpeechProvider } from "@/context/speech-context";

export default function FoundationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SpeechProvider>
      <PronunciationProvider>{children}</PronunciationProvider>
    </SpeechProvider>
  );
}
