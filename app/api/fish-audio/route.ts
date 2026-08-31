import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json();

    const response = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FISH_AUDIO_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        reference_id: voiceId || process.env.FISH_AUDIO_VOICE_ID || "default",
        format: "mp3",
        latency: "normal",
      }),
    });

    if (!response.ok) {
      throw new Error(`Fish Audio error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (error) {
    console.error("Fish Audio TTS failed:", error);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }
}