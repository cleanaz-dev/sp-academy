// app/api/livekit/token/route.ts
import { NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { requireUser } from "@/lib/auth-guard";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();

    const {
      lessonId,
      nativeLanguage = "en-US",
      targetLanguage = "fr-FR",
      targetVoiceId,
      freestyleData = {},
    } = body;

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl =
      process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: "LiveKit environment variables missing" },
        { status: 500 }
      );
    }

    const roomName = `freestyle-${user.id}-${lessonId || Date.now()}`;

    // Matches the exact keys read by src/agent.py!
    const metadata = JSON.stringify({
      userId: user.id,
      firstName: user.firstName || "Learner",
      nativeLanguage,
      targetLanguage,
      targetVoiceId: targetVoiceId || `${targetLanguage}-boy-01`,
      topic: freestyleData.topic || "Casual conversation",
      persona:
        freestyleData.persona ||
        freestyleData.aiRole ||
        "A friendly native speaker",
      openingLine:
        freestyleData.openingLine ||
        freestyleData.objective ||
        "Practice speaking naturally",
      requiredChunks:
        freestyleData.requiredChunks || freestyleData.targetPhrases || [],
      aiOpeningTarget: freestyleData.aiOpeningTarget || "",
      npcLine: freestyleData.npcLine || "",
      nativeSentence: freestyleData.nativeSentence || "",
    });

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: user.firstName || "Learner",
      ttl: "6m", // 5-minute sprint + 1m buffer
      metadata,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    return NextResponse.json({
      token,
      wsUrl,
      roomName,
    });
  } catch (err) {
    console.error("[LIVEKIT_TOKEN_ERROR]", err);
    return NextResponse.json(
      { error: "Failed to generate LiveKit token" },
      { status: 500 }
    );
  }
}