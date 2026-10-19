import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const InteractionSchema = z.object({
  word: z.string().min(1),
  seen: z.number().int().nonnegative().default(0),
  heard: z.number().int().nonnegative().default(0),
  tappedCorrect: z.number().int().nonnegative().default(0),
  tappedWrong: z.number().int().nonnegative().default(0),
  spokenAttempt: z.boolean().default(false),
  spokenScore: z.number().min(0).max(100).optional(),
  // Optional metadata if passed from client
  translation: z.string().optional(),
  partOfSpeech: z.string().optional(),
  wordType: z.enum(["WORD", "PHRASE"]).optional(),
});

export const MatrixSyncPayloadSchema = z.object({
  interactions: z.array(InteractionSchema).min(1),
});

interface Params {
  params: Promise<{ userId: string; targetLang: string }>;
}

function computeStatus(masteryScore: number, avgSpokenScore: number | null): string {
  if (masteryScore >= 15 && (avgSpokenScore ?? 0) >= 80) return "MASTERED";
  if (masteryScore >= 8) return "FAMILIAR";
  if (masteryScore >= 2) return "LEARNING";
  return "NEW";
}

export async function POST(req: Request, { params }: Params) {
  try {
    const { userId, targetLang } = await params;
    const body = await req.json();

    const parsedBody = MatrixSyncPayloadSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid data format", details: parsedBody.error.format() },
        { status: 400 }
      );
    }

    const { interactions } = parsedBody.data;

    // 1. Find or create the Language Profile for this user
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

    // 2. Fetch existing WordStats for these words so we can calculate accurate rolling averages & status
    const normalizedWords = interactions.map((i) =>
      i.word.trim().toLowerCase().replace(/[.,!?;:"']/g, "").trim()
    );

    const existingStats = await prisma.wordStat.findMany({
      where: {
        languageProfileId: profile.id,
        word: { in: normalizedWords },
      },
    });

    const existingMap = new Map(existingStats.map((s) => [s.word, s]));

    // 3. Upsert each WordStat with true rolling average & automatic status progression
    const upsertPromises = interactions
      .map((interaction) => {
        const cleanWord = interaction.word
          .trim()
          .toLowerCase()
          .replace(/[.,!?;:"]/g, "")
          .trim();
        if (!cleanWord) return null;

        const existing = existingMap.get(cleanWord);

        const interactionMasteryBump =
          interaction.tappedCorrect * 1 +
          interaction.heard * 0.25 +
          (interaction.spokenAttempt && interaction.spokenScore !== undefined
            ? (interaction.spokenScore / 100) * 3
            : 0);

        const newMasteryScore =
          (existing?.masteryScore ?? 0) + interactionMasteryBump;

        // Calculate true rolling average for spoken pronunciation
        let newAvgSpoken = existing?.avgSpokenScore ?? null;
        if (interaction.spokenAttempt && interaction.spokenScore !== undefined) {
          const prevAttempts = existing?.spokenAttempts ?? 0;
          const prevAvg = existing?.avgSpokenScore ?? interaction.spokenScore;
          newAvgSpoken =
            prevAttempts === 0
              ? interaction.spokenScore
              : Math.round(
                  ((prevAvg * prevAttempts + interaction.spokenScore) /
                    (prevAttempts + 1)) *
                    10
                ) / 10;
        }

        const newStatus = computeStatus(newMasteryScore, newAvgSpoken);
        const inferredWordType =
          interaction.wordType ??
          (cleanWord.includes(" ") || cleanWord.includes("'") ? "PHRASE" : "WORD");

        return prisma.wordStat.upsert({
          where: {
            languageProfileId_word: {
              languageProfileId: profile.id,
              word: cleanWord,
            },
          },
          update: {
            seenCount: { increment: interaction.seen || 0 },
            heardCount: { increment: interaction.heard || 0 },
            tappedCorrect: { increment: interaction.tappedCorrect || 0 },
            tappedWrong: { increment: interaction.tappedWrong || 0 },
            spokenAttempts: { increment: interaction.spokenAttempt ? 1 : 0 },
            avgSpokenScore: newAvgSpoken,
            lastSeenAt: new Date(),
            ...(interaction.heard ? { lastHeardAt: new Date() } : {}),
            ...(interaction.tappedCorrect || interaction.tappedWrong
              ? { lastTappedAt: new Date() }
              : {}),
            ...(interaction.spokenAttempt ? { lastSpokenAt: new Date() } : {}),
            masteryScore: newMasteryScore,
            status: newStatus,
            ...(interaction.translation ? { translation: interaction.translation } : {}),
            ...(interaction.partOfSpeech ? { partOfSpeech: interaction.partOfSpeech } : {}),
          },
          create: {
            languageProfileId: profile.id,
            word: cleanWord,
            wordType: inferredWordType,
            partOfSpeech: interaction.partOfSpeech || "OTHER",
            translation: interaction.translation || null,
            seenCount: interaction.seen || 1,
            heardCount: interaction.heard || 0,
            tappedCorrect: interaction.tappedCorrect || 0,
            tappedWrong: interaction.tappedWrong || 0,
            spokenAttempts: interaction.spokenAttempt ? 1 : 0,
            avgSpokenScore: interaction.spokenScore ?? null,
            lastSeenAt: new Date(),
            lastHeardAt: interaction.heard ? new Date() : null,
            lastTappedAt:
              interaction.tappedCorrect || interaction.tappedWrong
                ? new Date()
                : null,
            lastSpokenAt: interaction.spokenAttempt ? new Date() : null,
            masteryScore: interactionMasteryBump,
            status: newStatus,
          },
        });
      })
      .filter((p): p is NonNullable<typeof p> => p !== null);

    await prisma.$transaction(upsertPromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Matrix Sync Error:", error);
    return NextResponse.json(
      { error: "Failed to sync matrix" },
      { status: 500 }
    );
  }
}