// app/api/users/[userId]/sprite/sessions/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isUser } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function getOrCreateProfileId(userId: string): Promise<string> {
  const existing = await prisma.spriteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (existing) return existing.id;

  let sprite = await prisma.sprite.findFirst({
    where: { slug: "vox" },
  });

  if (!sprite) {
    sprite = await prisma.sprite.create({
      data: {
        slug: "vox",
        name: "Vox",
        avatarUrl: "/sprite-m.png",
        moodUrls: [],
      },
    });
  }

  const created = await prisma.spriteProfile.create({
    data: {
      userId,
      spriteId: sprite.id,
      nativeLanguage: "en-US",
      targetLanguage: "fr-FR",
      nativeVoiceId: "en-US-boy-01",
      targetVoiceId: "fr-FR-boy-01",
    },
    select: { id: true },
  });

  return created.id;
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

  try {
    const profileId = await getOrCreateProfileId(userId);

    const sessions = await prisma.spriteSession.findMany({
      where: { spriteProfileId: profileId },
      orderBy: { updatedAt: "desc" },
      take: 30,
    });

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("[SpriteSessions GET Error]:", err);
    return NextResponse.json(
      { sessions: [], error: String(err) },
      { status: 500 }
    );
  }
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
      return NextResponse.json(
        { error: "Missing sessionId or turn" },
        { status: 400 }
      );
    }

    const profileId = await getOrCreateProfileId(userId);

    const existingSession = await prisma.spriteSession.findUnique({
      where: { id: sessionId },
    });

    const existingTurns = Array.isArray(existingSession?.turns)
      ? (existingSession.turns as any[])
      : [];

    const alreadySavedIndex = existingTurns.findIndex(
      (t: any) =>
        t.id === turn.id ||
        (t.userPrompt === turn.userPrompt &&
          t.assistantReply === turn.assistantReply)
    );

    let updatedTurns: any[];
    if (alreadySavedIndex !== -1) {
      const prevTurn = existingTurns[alreadySavedIndex];
      updatedTurns = [...existingTurns];
      updatedTurns[alreadySavedIndex] = {
        ...prevTurn,
        ...turn,
        translation: turn.translation ?? prevTurn.translation ?? null,
        isTranslationRequired: Boolean(
          turn.isTranslationRequired ??
            prevTurn.isTranslationRequired ??
            turn.translation ??
            prevTurn.translation
        ),
        chalkboard: turn.chalkboard ?? prevTurn.chalkboard ?? null,
        contextCard: turn.contextCard ?? prevTurn.contextCard ?? null,
        action: turn.action ?? prevTurn.action ?? null,
      };
    } else {
      updatedTurns = [...existingTurns, turn];
    }

    const autoTitle =
      existingSession?.title && existingSession.title !== "New Session"
        ? existingSession.title
        : String(turn.userPrompt || lessonTitle || "Session").slice(0, 48);

    const incomingBoard =
      turn.chalkboard &&
      turn.chalkboard.title !== "__STEP_UPDATE__" &&
      Array.isArray(turn.chalkboard.steps) &&
      turn.chalkboard.steps.length > 0
        ? turn.chalkboard
        : null;

    const finalBoard = incomingBoard ?? existingSession?.board ?? null;

    await prisma.spriteSession.upsert({
      where: { id: sessionId },
      create: {
        id: sessionId,
        spriteProfileId: profileId,
        title: autoTitle,
        lessonTitle: lessonTitle || "Active Lesson",
        turns: updatedTurns,
        ...(finalBoard ? { board: finalBoard } : {}),
      },
      update: {
        title: autoTitle,
        turns: updatedTurns,
        ...(finalBoard ? { board: finalBoard } : {}),
      },
    });

    const sessions = await prisma.spriteSession.findMany({
      where: { spriteProfileId: profileId },
      orderBy: { updatedAt: "desc" },
      take: 30,
    });

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("[SpriteSessions POST Error]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}