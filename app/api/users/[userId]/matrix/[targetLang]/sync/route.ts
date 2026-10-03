import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

export const InteractionSchema = z.object({
  word: z.string().min(1),
  seen: z.number().int().nonnegative().default(0),
  heard: z.number().int().nonnegative().default(0), // <-- ADDED
  tappedCorrect: z.number().int().nonnegative().default(0),
  tappedWrong: z.number().int().nonnegative().default(0),
  spokenAttempt: z.boolean().default(false),
  spokenScore: z.number().min(0).max(100).optional(),
});

export const MatrixSyncPayloadSchema = z.object({
  interactions: z.array(InteractionSchema).min(1),
});

interface Params {
  params: Promise<{ userId: string; targetLang: string }>;
}

export async function POST(req: Request, { params }: Params) {
  try {
    // 1. Extract dynamic variables straight from the URL path
    const { userId, targetLang } = await params;

    // 2. The body now ONLY needs to care about the actual interaction data
    const body = await req.json();

    const parsedBody = MatrixSyncPayloadSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid data format", details: parsedBody.error.format() },
        { status: 400 },
      );
    }
    const { interactions } = body;

    if (!interactions || !Array.isArray(interactions)) {
      return NextResponse.json(
        { error: "Invalid interactions payload" },
        { status: 400 },
      );
    }

    // 3. Find or create the Language Profile for this user
    const profile = await prisma.languageProfile.upsert({
      where: {
        userId_languageCode: { userId, languageCode: targetLang },
      },
      update: {},
      create: {
        userId,
        languageCode: targetLang,
      },
    });

    // 4. Upsert the Word Stats
    const upsertPromises = interactions.map((interaction: any) => {
      const interactionMasteryBump =
        interaction.tappedCorrect * 1 +
        (interaction.spokenAttempt ? (interaction.spokenScore / 100) * 3 : 0);

      return prisma.wordStat.upsert({
        where: {
          languageProfileId_word: {
            languageProfileId: profile.id,
            word: interaction.word,
          },
        },
        update: {
          seenCount: { increment: interaction.seen || 0 },
          tappedCorrect: { increment: interaction.tappedCorrect || 0 },
          tappedWrong: { increment: interaction.tappedWrong || 0 },
          spokenAttempts: { increment: interaction.spokenAttempt ? 1 : 0 },
          // Rolling average logic placeholder
          avgSpokenScore: interaction.spokenAttempt
            ? interaction.spokenScore
            : undefined,
          lastSeenAt: new Date(),
          ...(interaction.tappedCorrect || interaction.tappedWrong
            ? { lastTappedAt: new Date() }
            : {}),
          ...(interaction.spokenAttempt ? { lastSpokenAt: new Date() } : {}),
          masteryScore: { increment: interactionMasteryBump },
        },
        create: {
          languageProfileId: profile.id,
          word: interaction.word,
          seenCount: interaction.seen || 1,
          tappedCorrect: interaction.tappedCorrect || 0,
          tappedWrong: interaction.tappedWrong || 0,
          spokenAttempts: interaction.spokenAttempt ? 1 : 0,
          avgSpokenScore: interaction.spokenScore || null,
          lastSeenAt: new Date(),
          lastTappedAt:
            interaction.tappedCorrect || interaction.tappedWrong
              ? new Date()
              : null,
          lastSpokenAt: interaction.spokenAttempt ? new Date() : null,
          masteryScore: interactionMasteryBump,
          status: "NEW",
        },
      });
    });

    await prisma.$transaction(upsertPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Matrix Sync Error:", error);
    return NextResponse.json(
      { error: "Failed to sync matrix" },
      { status: 500 },
    );
  }
}
