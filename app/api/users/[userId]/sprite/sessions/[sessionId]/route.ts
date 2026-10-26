import { isUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{
    userId: string;
    sessionId: string;
  }>;
}

// GET one session (full turns, for loading a chat from History)
export async function GET(_req: Request, { params }: Params) {
  const { sessionId, userId } = await params;

  const user = await isUser(userId);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const session = await prisma.spriteSession.findFirst({
      where: {
        id: sessionId,
        spriteProfile: { userId },
      },
      select: {
        id: true,
        title: true,
        lessonTitle: true,
        turns: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("[GET sprite session]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE one session
export async function DELETE(_req: Request, { params }: Params) {
  const { sessionId, userId } = await params;

  const user = await isUser(userId);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ownership check + delete in one atomic query
    const { count } = await prisma.spriteSession.deleteMany({
      where: {
        id: sessionId,
        spriteProfile: { userId },
      },
    });

    if (count === 0) {
      return NextResponse.json(
        { message: "Session not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Session deleted" }, { status: 200 });
  } catch (error) {
    console.error("[DELETE sprite session]", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}