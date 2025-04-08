//api/generate/sound-effects/route.js

import { NextResponse } from "next/server";

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/sound-generation";

export async function POST(request) {
  try {
    const { soundEffectPrompt } = await request.json();
    console.log("Sound effect prompt:", soundEffectPrompt);

    if (!soundEffectPrompt) {
      return NextResponse.json(
        { message: "Missing sound effect prompt" },
        { status: 400 },
      );
    }

    const response = await fetch(ELEVENLABS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: soundEffectPrompt,
        duration_seconds: 2,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "API request failed" },
        { status: 500 },
      );
    }

    // Retrieve the audio data from the external API as an ArrayBuffer.
    const audioBuffer = await response.arrayBuffer();

    // Return a new response with the audio data and proper content type.
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "An error occurred while generating sound effect" },
      { status: 500 },
    );
  }
}
