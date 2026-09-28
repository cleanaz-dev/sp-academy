import { PronunciationProvider } from "@/context/pronunciation-context";
import { S3Provider } from "@/context/s3-context";
import { SpeechProvider } from "@/context/speech-context";

export default function FoundationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <S3Provider>
    <SpeechProvider>
      <PronunciationProvider>{children}</PronunciationProvider>
    </SpeechProvider>
    </S3Provider>
  );
}
