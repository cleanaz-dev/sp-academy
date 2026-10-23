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
      freestyleData = {},
    } = body;

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json(
        { error: "LiveKit environment variables missing" },
        { status: 500 }
      );
    }

    const roomName = `freestyle-${user.id}-${lessonId || Date.now()}`;

    // Pass all lesson & language context inside participant metadata!
    const metadata = JSON.stringify({
      userId: user.id,
      firstName: user.firstName || "Learner",
      nativeLanguage,
      targetLanguage,
      setting: freestyleData.setting || "Casual conversation",
      aiRole: freestyleData.aiRole || "Native speaker friend",
      userGoal: freestyleData.objective || "Practice speaking naturally",
      nativeSentence: freestyleData.nativeSentence || "",
      targetPhrases: freestyleData.targetPhrases || [],
    });

    const at = new AccessToken(apiKey, apiSecret, {
      identity: user.id,
      name: user.firstName || "Learner",
      ttl: "6m", // Hard 5-6 minute sprint cap
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