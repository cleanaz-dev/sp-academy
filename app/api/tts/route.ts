// app/api/tts/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Extract speed from the request body (default to 1.0 if not provided)
    const { text, language, speed = 1.0 } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const apiKey = process.env.NOVITA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    // Call Novita Fish Audio API
    const response = await fetch("https://api.novita.ai/v3/fish-audio-s2-pro-text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
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
        
        // NOTE: If Novita requires a specific voice ID/reference, 
        // you may need to add "reference_id": "YOUR_VOICE_ID" here depending on their docs.
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Novita Error:", errorText);
      return NextResponse.json({ error: "Novita API Failed" }, { status: response.status });
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