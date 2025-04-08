import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { text, speaker, language } = await request.json();
    console.log("text:", text, "speaker:", speaker, "language:", language);
    if (!text || !speaker || !language) {
      return NextResponse.json(
        { error: "Missing text, speaker, or language" },
        { status: 400 },
      );
    }

    const API_KEY = process.env.ELEVENLABS_API_KEY;
    const MALE_VOICE = "GPAQQPp9dazaB2bl4zg9";
    const FEMALE_VOICE =
      process.env.ELEVENLABS_FRENCH_FEMALE_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

    if (!API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      );
    }

    // Normalize speaker and select voice
    const VOICE_ID =
      speaker && speaker.trim().toLowerCase() === "male"
        ? MALE_VOICE
        : FEMALE_VOICE;
    console.log("Selected VOICE_ID:", VOICE_ID);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": API_KEY,
          "Content-Type": "application/json",
          accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    return new NextResponse(response.body, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error in POST /api/speak:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 },
    );
  }
}
