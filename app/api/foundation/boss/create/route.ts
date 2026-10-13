import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-guard";

export async function POST(request: Request) {
  try {
    // 1. Safely check session for API routes (NO redirect() calls)
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const {
      topic,
      nativeLanguage,
      targetLanguage,
      aiAvatarUrl,
      freestyleData,
    } = body;

    // 2. Safe fallbacks so Prisma doesn't crash on null/undefined
    const safeNativeLang = nativeLanguage || "en-US";
    const safeTargetLang = targetLanguage || "fr-FR";

    // 3. Create the session
    const freestyleSession = await prisma.freestyleSession.create({
      data: {
        userId,
        mode: "SPECIFIC", // Make sure "SPECIFIC" exists in your enum, or use whatever default your model expects
        topic: topic || "General Conversation",
        nativeLanguage: safeNativeLang,
        targetLanguage: safeTargetLang,
        aiAvatarUrl: aiAvatarUrl || null,
        status: "IN_PROGRESS",
        duration: 0,
        isFoundation: true,
      },
    });

    return NextResponse.json({
      sessionId: freestyleSession.id,
      aiAvatarUrl: freestyleSession.aiAvatarUrl,
      freestyleData,
    });
  } catch (error) {
    // 🔍 This prints the EXACT Prisma / DB error to your terminal
    console.error("Create Foundation Session Error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to create foundation session";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}