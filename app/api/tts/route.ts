// app/api/tts/route.ts
import { NextResponse } from "next/server";

export const maxDuration = 60;

// 💡 Map your languages and genders to your Fish Audio reference_ids here.
// Find these IDs in your Fish Audio dashboard for the voices you created/saved.
const VOICE_MAP: Record<string, Record<string, string>> = {
  "en-US": { male: "YOUR_EN_MALE_ID", female: "YOUR_EN_FEMALE_ID" },
  "fr-FR": { male: "YOUR_FR_MALE_ID", female: "YOUR_FR_FEMALE_ID" },
  "es-ES": { male: "YOUR_ES_MALE_ID", female: "YOUR_ES_FEMALE_ID" },
};

// A fallback if the language isn't in the map, or for older components that don't pass gender.
const FALLBACK_VOICE_ID = "YOUR_DEFAULT_VOICE_ID"; 

export async function POST(request: Request) {
  try {
    // 💡 Added gender with a default value of "female" so legacy code doesn't break
    const { text, language, speed = 1.0, gender = "female" } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.FISH_AUDIO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    // Determine the reference ID based on the map, or fallback
    const referenceId = VOICE_MAP[language]?.[gender] || FALLBACK_VOICE_ID;

    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "model": "s2.1-pro-free", 
      },
      body: JSON.stringify({
        text: text,
        top_p: 0.7,
        format: "mp3",
        latency: "normal",
        prosody: {
          speed: Number(speed),
          volume: 0,
          normalize_loudness: true,
        },
        normalize: true,
        mp3_bitrate: 128,
        temperature: 0.7,
        chunk_length: 300,
        opus_bitrate: -1000,
        max_new_tokens: 1024,
        min_chunk_length: 50,
        repetition_penalty: 1.2,
        early_stop_threshold: 1,
        condition_on_previous_chunks: true,
        // 💡 Pass the selected voice ID here
        reference_id: referenceId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fish Audio Error:", errorText);
      return NextResponse.json({ error: "Fish Audio API Failed" }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });

  } catch (error) {
    console.error("TTS Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}