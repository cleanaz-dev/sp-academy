// app/api/tts/route.ts
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    // Extract speed from the request body (default to 1.0 if not provided)
    const { text, language, speed = 1.0 } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.FISH_AUDIO_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    // Call Fish Audio API directly
    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "model": "s2.1-pro-free", // or "s2.1-pro" once you're on the paid tier
      },
      body: JSON.stringify({
        text: text,
        top_p: 0.7,
        format: "mp3",
        latency: "normal",
        prosody: {
          speed: Number(speed), // Dynamically set the speed here
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

        // Fish Audio uses "reference_id" for voice selection, not a "language" param.
        // If you have a cloned/uploaded voice, set it here:
        // "reference_id": "YOUR_VOICE_ID",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fish Audio Error:", errorText);
      return NextResponse.json({ error: "Fish Audio API Failed" }, { status: response.status });
    }

    // Get the binary audio data
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return it to the frontend player
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