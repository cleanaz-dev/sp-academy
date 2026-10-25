// app/api/users/[userId]/matrix/[targetLang]sync/route.ts
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
  translation: z.string().optional(),
  partOfSpeech: z.string().optional(),
  wordType: z.enum(["WORD", "PHRASE"]).optional(),
  lemma: z.string().optional(),
  grammaticalGender: z.enum(["M", "F"]).nullable().optional(),
  audioMaleKey: z.string().optional(),
  audioFemaleKey: z.string().optional(),
});

export const MatrixSyncPayloadSchema = z.object({
  interactions: z.array(InteractionSchema).min(1),
});

interface Params {
  params: Promise<{ userId: string; targetLang: string }>;
}

function cleanCanonicalWord(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:"]+$/g, "")
    .replace(/^[.,!?;:"]+/g, "")
    .trim();
}

function normalizeSlug(word: string): string {
  return word
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "_");
}

function inferDefaults(cleanWord: string) {
  if (cleanWord.startsWith("le ") || cleanWord.startsWith("un ")) {
    return {
      gender: "M",
      lemma: cleanWord.replace(/^(le|un)\s+/, ""),
      pos: "NOUN",
    };
  }
  if (cleanWord.startsWith("la ") || cleanWord.startsWith("une ")) {
    return {
      gender: "F",
      lemma: cleanWord.replace(/^(la|une)\s+/, ""),
      pos: "NOUN",
    };
  }
  return {
    gender: null,
    lemma: cleanWord,
    pos: cleanWord.includes(" ") ? "EXPRESSION" : "VOCABULARY",
  };
}

function computeStatus(
  masteryScore: number,
  avgSpokenScore: number | null
): string {
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

    const normalizedWords = interactions
      .map((i) => cleanCanonicalWord(i.word))
      .filter(Boolean);

    const existingStats = await prisma.wordStat.findMany({
      where: {
        languageProfileId: profile.id,
        word: { in: normalizedWords },
      },
    });

    const existingMap = new Map(existingStats.map((s) => [s.word, s]));

    const upsertPromises = interactions
      .map((interaction) => {
        const cleanWord = cleanCanonicalWord(interaction.word);
        if (!cleanWord) return null;

        // Ignore accidental English lesson/grammar titles containing parentheses
        if (cleanWord.includes("(") && cleanWord.includes(")")) return null;

        const existing = existingMap.get(cleanWord);
        const defaults = inferDefaults(cleanWord);
        const slug = normalizeSlug(cleanWord);

        const interactionMasteryBump =
          interaction.tappedCorrect * 1 +
          interaction.heard * 0.25 +
          (interaction.spokenAttempt && interaction.spokenScore !== undefined
            ? (interaction.spokenScore / 100) * 3
            : 0);

        const newMasteryScore =
          (existing?.masteryScore ?? 0) + interactionMasteryBump;

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
          (cleanWord.includes(" ") || cleanWord.includes("'")
            ? "PHRASE"
            : "WORD");
        const componentWords =
          inferredWordType === "PHRASE"
            ? cleanWord.split(/[\s']+/).filter(Boolean)
            : [];

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
            ...(interaction.translation
              ? { translation: interaction.translation }
              : {}),
            ...(interaction.partOfSpeech
              ? { partOfSpeech: interaction.partOfSpeech }
              : {}),
            ...(interaction.lemma ? { lemma: interaction.lemma } : {}),
            ...(interaction.grammaticalGender !== undefined
              ? { grammaticalGender: interaction.grammaticalGender }
              : {}),
          },
          create: {
            languageProfileId: profile.id,
            word: cleanWord,
            wordType: inferredWordType,
            partOfSpeech: interaction.partOfSpeech || defaults.pos,
            translation: interaction.translation || null,
            lemma: interaction.lemma || defaults.lemma,
            grammaticalGender:
              interaction.grammaticalGender ?? defaults.gender,
            componentWords,
            audioMaleKey:
              interaction.audioMaleKey ||
              `foundation/words/${targetLang}/m/${slug}.mp3`,
            audioFemaleKey:
              interaction.audioFemaleKey ||
              `foundation/words/${targetLang}/f/${slug}.mp3`,
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