// lib/deepgram/services/tts-service.ts

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

export const textToSpeech = async (
  text: string, 
  options: { language: string; voiceGender: string }
): Promise<string> => {
  if (!DEEPGRAM_API_KEY) {
    throw new Error("DEEPGRAM_API_KEY is not defined in environment variables");
  }

  // 1. Map Language/Gender to Deepgram Aura Models
  // Note: Deepgram TTS is primarily English-optimized right now. 
  // Check Deepgram docs for the latest model list for other languages.
  const voices: Record<string, Record<string, string>> = {
    en: { male: "aura-2-odysseus-en", female: "aura-2-thalia-en" },
    
    // Deepgram currently has limited non-English TTS models compared to Polly.
    // If specific FR/ES models aren't available, you may need to fallback to EN 
    // or checks for new releases like 'aura-asteria-fr' (hypothetical).
    // For now, I have mapped these to the standard English voices to prevent crashes,
    // but you should update these string IDs as Deepgram releases new languages.
    fr: { male: "aura-2-hector-fr", female: "aura-2-agathe-fr" }, 
    es: { male: "aura-2-alvaro-es", female: "aura-2-celeste-es" },
  };

  const model = voices[options.language]?.[options.voiceGender] || "aura-2-apollo-en";

  // 2. Construct the URL
  const url = `https://api.deepgram.com/v1/speak?model=${model}`;

  // 3. Make the request
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Token ${DEEPGRAM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Deepgram TTS failed: ${response.status} ${errorText}`);
  }

  // 4. Convert stream to Buffer -> Base64
  // Fetch API response.arrayBuffer() is easier to handle than AWS streams
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  return buffer.toString("base64");
};