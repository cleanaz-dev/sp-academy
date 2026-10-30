// app/api/users/[userId]/sprite/tts/route.ts
import { NextResponse } from "next/server";
import { isUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // 1. Auth guard (protects your Fish Audio credits!)
    const user = await isUser(userId);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.FISH_API_KEY ?? process.env.FISH_AUDIO_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing FISH_API_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const cleanedText = typeof body.text === "string" ? body.text.trim() : "";
    if (!cleanedText) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // 2. Resolve voiceId: use client-provided voiceId if present, otherwise fetch from SpriteProfile in DB
    let resolvedVoiceId: string | undefined = body.voiceId;

    if (!resolvedVoiceId) {
      const profile = await prisma.spriteProfile.findUnique({
        where: { userId },
        select: { nativeVoiceId: true, targetVoiceId: true },
      });

      if (profile) {
        resolvedVoiceId =
          body.isTargetLang === true
            ? profile.targetVoiceId
            : profile.nativeVoiceId;
      }
    }

    // 3. Call Fish Audio TTS
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
        ...(resolvedVoiceId ? { reference_id: resolvedVoiceId } : {}),
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