import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    // Notice we are also grabbing the extra foundation constraints now
    const { mode, topic, nativeLanguage, targetLanguage, aiAvatarUrl, freestyleData } = body;

    // Create the Session row in Prisma
    const session = await prisma.freestyleSession.create({
      data: {
        user: { connect: { userId: clerkUserId } },
        // We can prefix the mode so your DB knows this was a course session, not a random freestyle
        mode: "SPECIFIC", 
        topic: topic || null,
        nativeLanguage: nativeLanguage,
        targetLanguage: targetLanguage,
        status: "IN_PROGRESS",
        duration: 0,
        // (Optional) If you have a JSON field in Prisma like 'metadata', you can save freestyleData here!
        // metadata: freestyleData 
      },
    });

    return NextResponse.json({ 
      sessionId: session.id,
      // Pass the constraints back so the client provider has them verified
      freestyleData 
    });
  } catch (error) {
    console.error("Create Foundation Session Error:", error);
    return NextResponse.json(
      { error: "Failed to create foundation session" },
      { status: 500 },
    );
  }
}