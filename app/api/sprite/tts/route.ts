// app/api/sprite/tts/route.ts
import { NextResponse } from "next/server";

// Optional: Map your internal Prisma voiceIds to Fish Audio reference_ids (if you use custom voices)
const VOICE_MAP: Record<string, string | undefined> = {
  "en-US-boy-01": process.env.FISH_VOICE_VOX_EN,
  "fr-FR-boy-01": process.env.FISH_VOICE_VOX_FR,
  "en-US-girl-01": process.env.FISH_VOICE_VIVI_EN,
  "fr-FR-girl-01": process.env.FISH_VOICE_VIVI_FR,
};

export async function POST(req: Request) {
  try {
    const apiKey = process.env.FISH_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing FISH_API_KEY" },
        { status: 500 }
      );
    }

    const { text, voiceId } = await req.json();
    const cleanedText = typeof text === "string" ? text.trim() : "";

    if (!cleanedText) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    const referenceId = voiceId ? VOICE_MAP[voiceId] : undefined;

    const fishRes = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        model: "s2.1-pro-free",
      },
      body: JSON.stringify({
        text: cleanedText,
        format: "mp3",
        ...(referenceId ? { reference_id: referenceId } : {}),
      }),
    });

    if (!fishRes.ok) {
      const errText = await fishRes.text().catch(() => "");
      console.error("[sprite-tts] Fish Audio error:", fishRes.status, errText);
      return NextResponse.json(
        { error: "TTS generation failed" },
        { status: 502 }
      );
    }

    const audioBuffer = await fishRes.arrayBuffer();

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[sprite-tts] Error:", error);
    return NextResponse.json({ error: "Internal TTS error" }, { status: 500 });
  }
}