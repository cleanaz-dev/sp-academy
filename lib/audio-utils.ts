// lib/audio-utils.ts (or add to your existing utils.ts)
export async function convertBlobToWav(blob: Blob): Promise<Blob> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 16000,
  });

  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Extract mono channel
  const pcmData = audioBuffer.getChannelData(0);

  // Build 16-bit PCM WAV container
  const wavBuffer = new ArrayBuffer(44 + pcmData.length * 2);
  const view = new DataView(wavBuffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + pcmData.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 = Mono)
  view.setUint32(24, 16000, true); // SampleRate
  view.setUint32(28, 16000 * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)
  writeString(36, "data");
  view.setUint32(40, pcmData.length * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < pcmData.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, pcmData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  await audioContext.close();
  return new Blob([view], { type: "audio/wav" });
}