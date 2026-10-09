// app/api/freestyle/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const userId = user.id;


    const body = await request.json();
    const { mode, topic, nativeLanguage, targetLanguage, aiAvatarUrl } = body;

    // Create the Session row in Prisma
    const session = await prisma.freestyleSession.create({
      data: {
        user: { connect: { id: userId } },
        mode: mode,
        topic: topic || null,
        nativeLanguage: nativeLanguage,
        targetLanguage: targetLanguage,
        status: "IN_PROGRESS",
        duration: 0,
        // If you added aiAvatarUrl to schema, save it here, otherwise omit
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Create Session Error:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}
