import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      mode,
      topic,
      nativeLanguage,
      targetLanguage,
      aiAvatarUrl,
      freestyleData,
    } = body;

    const session = await prisma.freestyleSession.create({
      data: {
        user: { connect: { userId: clerkUserId } },
        mode: "SPECIFIC",
        topic: topic || null,
        nativeLanguage: nativeLanguage,
        targetLanguage: targetLanguage,
        aiAvatarUrl: aiAvatarUrl || null,
        status: "IN_PROGRESS",
        duration: 0,
        // metadata: freestyleData
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      aiAvatarUrl: session.aiAvatarUrl,
      freestyleData,
    });
  } catch (error) {
    console.error("Create Foundation Session Error:", error);
    return NextResponse.json(
      { error: "Failed to create foundation session" },
      { status: 500 },
    );
  }
}