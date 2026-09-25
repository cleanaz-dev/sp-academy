import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// utils/audioUtils.js
export function convertToWav(audioData) {
  const numChannels = 1;
  const sampleRate = 44100;
  const bitsPerSample = 16;

  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + audioData.byteLength, true);
  writeString(view, 8, "WAVE");

  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true);
  view.setUint16(32, numChannels * (bitsPerSample / 8), true);
  view.setUint16(34, bitsPerSample, true);

  writeString(view, 36, "data");
  view.setUint32(40, audioData.byteLength, true);

  const wavFile = new Uint8Array(header.byteLength + audioData.byteLength);
  wavFile.set(new Uint8Array(header), 0);
  wavFile.set(new Uint8Array(audioData), header.byteLength);

  return wavFile;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function getDeepgramLanguageCode(prismaLanguage: string): string {
  const map: Record<string, string> = {
    ENGLISH: "en-US",
    FRENCH: "fr-FR",
    SPANISH: "es-ES",
    GERMAN: "de-DE",
    ITALIAN: "it-IT",
    JAPANESE: "ja-JP",
    CHINESE: "zh-CN",
  };

  return map[prismaLanguage.toUpperCase()] || "en-US";
}