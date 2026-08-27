// app/api/freestyle/create/route.ts
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server"; // Or your auth
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { mode, topic, nativeLanguage, targetLanguage, aiAvatarUrl } = body;

    // Create the Session row in Prisma
    const session = await prisma.freestyleSession.create({
      data: {
        userId: user.id,
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
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}