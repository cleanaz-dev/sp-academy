// app/api/users/[userId]/sprite/sessions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUser } from "@/lib/auth-guard";
import { SpriteSessionTurnsSchema } from "@/lib/schema/sprite-schema";

export const dynamic = "force-dynamic";

async function getOrCreateSpriteProfile(userId: string) {
  const existing = await prisma.spriteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (existing) return existing;

  let defaultSprite = await prisma.sprite.findFirst({
    where: { slug: "vox" },
  });

  if (!defaultSprite) {
    defaultSprite = await prisma.sprite.create({
      data: {
        slug: "vox",
        name: "Vox",
        avatarUrl: "/sprite-m.png",
        moodUrls: [],
      },
    });
  }

  return prisma.spriteProfile.create({
    data: {
      userId,
      spriteId: defaultSprite.id,
      nativeLanguage: "en-US",
      targetLanguage: "fr-FR",
      nativeVoiceId: "en-US-boy-01",
      targetVoiceId: "fr-FR-boy-01",
    },
    select: { id: true },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await isUser(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const profile = await prisma.spriteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ sessions: [] });
  }

  const sessions = await prisma.spriteSession.findMany({
    where: { spriteProfileId: profile.id },
    orderBy: { updatedAt: "desc" },
    take: 30,
  });

  return NextResponse.json({ sessions });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const user = await isUser(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { sessionId, lessonTitle, turn } = body;

    if (!sessionId || !turn) {
      return NextResponse.json({ error: "Missing sessionId or turn" }, { status: 400 });
    }

    const profile = await getOrCreateSpriteProfile(userId);

    const existingSession = await prisma.spriteSession.findUnique({
      where: { id: sessionId },
    });

    const existingTurns = existingSession
      ? SpriteSessionTurnsSchema.catch([]).parse(existingSession.turns)
      : [];

    const alreadyExists = existingTurns.some((t) => t.id === turn.id);
    const updatedTurns = alreadyExists ? existingTurns : [...existingTurns, turn];

    const autoTitle =
      existingSession?.title && existingSession.title !== "New Session"
        ? existingSession.title
        : (turn.userPrompt || lessonTitle || "Practice Session").slice(0, 48);

    await prisma.spriteSession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        spriteProfileId: profile.id,
        title: autoTitle,
        lessonTitle: lessonTitle || "Active Lesson",
        turns: updatedTurns as any,
      },
      update: {
        title: autoTitle,
        turns: updatedTurns as any,
      },
    });

    const sessions = await prisma.spriteSession.findMany({
      where: { spriteProfileId: profile.id },
      orderBy: { updatedAt: "desc" },
      take: 30,
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("[SpriteSession POST] Failed to save session:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}