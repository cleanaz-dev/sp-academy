import { pollyClient } from '../client';
import { SynthesizeSpeechCommand, VoiceId } from '@aws-sdk/client-polly';
import type { StreamingBlobPayloadOutputTypes } from '@smithy/types';

export const textToSpeech = async (
  text: string, 
  options: { language: string; voiceGender: string }
): Promise<string> => {
  const voices: Record<string, Record<string, VoiceId>> = {
    fr: { male: VoiceId.Mathieu, female: VoiceId.Celine },
    es: { male: VoiceId.Enrique, female: VoiceId.Conchita },
    en: { male: VoiceId.Matthew, female: VoiceId.Joanna }
  };

  const voiceId = voices[options.language]?.[options.voiceGender] || VoiceId.Celine;

 const command = new SynthesizeSpeechCommand({
    OutputFormat: 'mp3',
    Text: text,
    VoiceId: voiceId,
    Engine: 'standard',
  });

  const response = await pollyClient.send(command);
  if (!response.AudioStream) throw new Error('No audio stream');

  const audioBuffer = await streamToBuffer(response.AudioStream);
  return audioBuffer.toString('base64');
};

// ✅ FINAL FIX: Use type assertion to tell TS "I know what I'm doing"
async function streamToBuffer(stream: StreamingBlobPayloadOutputTypes): Promise<Buffer> {
  // Handle the simple case first
  if (stream instanceof Uint8Array) {
    return Buffer.from(stream);
  }
  
  // ✅ Type assertion - after checking it's not Uint8Array, treat as async iterable
  const asyncStream = stream as AsyncIterable<Uint8Array>;
  const chunks: Uint8Array[] = [];
  
  for await (const chunk of asyncStream) {
    chunks.push(chunk);
  }
  
  // Combine chunks efficiently
  return Buffer.concat(chunks);
}