import { NextResponse } from "next/server";

// ⚡️ Edge runtime is REQUIRED for fetch streaming to work properly
export const runtime = "edge";
export const maxDuration = 60;

const VOICE_MAP: Record<string, Record<string, string>> = {
  "en-US": { male: "933563129e564b19a115bedd57b7406a", female: "802e3bc2b27e49c2995d23ef70e6ac89" },
  "fr-FR": { male: "83154314d3d64d56b8a434583a659a91", female: "690813f2df56491b82ee02a22d1c67fd" },
  "es-ES": { male: "43e1948b1a544700bd88250916cd31e8", female: "0118a35dcb604837abe7961a43e13ba8" },
};

const FALLBACK_VOICE_ID = "690813f2df56491b82ee02a22d1c67fd";

export async function POST(request: Request) {
  const reqId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    const { text, language, speed = 0.8, gender = "female" } = await request.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.FISH_AUDIO_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const referenceId = VOICE_MAP[language]?.[gender] || FALLBACK_VOICE_ID;

    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // 💡 Use s2.1-pro if you have a paid key — free tier can queue under load
        model: "s2.1-pro-free",
      },
      body: JSON.stringify({
        text: text.trim(),
        reference_id: referenceId,
        format: "mp3",
        normalize: true,
        // ⚡️ KEY CHANGE: balanced = lower time-to-first-audio (~300ms)
        latency: "balanced",
        prosody: {
          speed,
          volume: 0,
          normalize_loudness: true,
        },
        // 100 is already the minimum; smaller = faster first chunk
        chunk_length: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: "Fish Audio API Failed", details: errorText },
        { status: response.status }
      );
    }

    if (!response.body) {
      return NextResponse.json({ error: "No audio stream" }, { status: 500 });
    }

    // ⚡️ Pipe Fish Audio's stream directly to the client — DO NOT buffer here
    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "audio/mpeg",
        "Cache-Control": "no-cache",
        // ❌ Removed manual Transfer-Encoding — Edge runtime handles this
      },
    });
  } catch (error) {
    console.error(`[TTS-${reqId}] Error:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}