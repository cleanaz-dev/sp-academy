import { SpeechProvider } from "@/context/speech-context";

export default function ConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SpeechProvider>
      {children}
    </SpeechProvider>
  );
}