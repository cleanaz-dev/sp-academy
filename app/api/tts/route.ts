import { NextResponse } from "next/server";

export const maxDuration = 60;

const VOICE_MAP: Record<string, Record<string, string>> = {
  "en-US": { male: "933563129e564b19a115bedd57b7406a", female: "802e3bc2b27e49c2995d23ef70e6ac89" },
  "fr-FR": { male: "83154314d3d64d56b8a434583a659a91", female: "690813f2df56491b82ee02a22d1c67fd" },
  "es-ES": { male: "43e1948b1a544700bd88250916cd31e8", female: "0118a35dcb604837abe7961a43e13ba8" },
};
const FALLBACK_VOICE_ID = "690813f2df56491b82ee02a22d1c67fd"; 

export async function POST(request: Request) {
  const reqId = Math.random().toString(36).substring(7);
  console.log(`[TTS-${reqId}] 🟢 Incoming TTS Request`);

  try {
    const body = await request.json();
    console.log(`[TTS-${reqId}] Body received:`, body);

    const { text, language, speed = 1.0, gender = "female" } = body;

    if (!text || text.trim() === "") {
      console.warn(`[TTS-${reqId}] ❌ Error: Empty text provided`);
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.FISH_AUDIO_API_KEY;
    if (!apiKey) {
      console.error(`[TTS-${reqId}] ❌ Error: Missing FISH_AUDIO_API_KEY`);
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const referenceId = VOICE_MAP[language]?.[gender] || FALLBACK_VOICE_ID;
    console.log(`[TTS-${reqId}] Using Voice ID: ${referenceId} for Lang: ${language}, Gender: ${gender}`);

    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "model": "s2.1-pro-free", 
      },
      body: JSON.stringify({
        text: text,
        format: "mp3",
        reference_id: referenceId,
        normalize: true,
        latency: "normal",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TTS-${reqId}] ❌ Fish Audio API Failed (${response.status}):`, errorText);
      return NextResponse.json({ error: "Fish Audio API Failed" }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log(`[TTS-${reqId}] ✅ Success. Audio generated (${buffer.length} bytes)`);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error(`[TTS-${reqId}] ❌ Catch Error:`, error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}