import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

interface Params {
  params: Promise<{
    sessionId: string;
  }>;
}

export async function GET(_req: Request, { params }: Params) {
  const { sessionId } = await params;
  try {
    const session = await prisma.freestyleSession.findUnique({
      where: { id: sessionId },
      include: { review: true },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!session.review || session.review.lambdaStatus !== "SUCCESS") {
      return NextResponse.json({ error: "Review not ready" }, { status: 404 });
    }

    return NextResponse.json({
      session: {
        id: session.id,
        nativeLanguage: session.nativeLanguage,
        targetLanguage: session.targetLanguage,
        level: session.level,
        mode: session.mode,
        topic: session.topic,
        duration: session.duration,
      },
      review: session.review,
    });
  } catch (error) {
    console.error("Fetch review error:", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 },
    );
  }
}
