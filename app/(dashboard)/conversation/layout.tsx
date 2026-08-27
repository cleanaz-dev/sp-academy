import { PronunciationProvider } from "@/context/pronunciation-context";
import { SpeechProvider } from "@/context/speech-context";

export default function ConversationLayout({
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
