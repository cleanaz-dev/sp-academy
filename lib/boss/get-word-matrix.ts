// lib/boss/get-word-matrix.ts
import { prisma } from "@/lib/prisma";

export async function getWordMatrix(userId: string, languageCode: string) {
  const stats = await prisma.wordStat.findMany({
    where: {
      languageProfile: { userId, languageCode },
    },
    select: {
      word: true,
      status: true,
      masteryScore: true,
      seenCount: true,
      heardCount: true,
      tappedCorrect: true,
      tappedWrong: true,
      spokenAttempts: true,
      avgSpokenScore: true,
      nextReviewDate: true,
    },
    orderBy: { masteryScore: "asc" }, // weakest words first
  });

  return stats.map((s) => ({
    ...s,
    masteryScore: Math.round(s.masteryScore * 100) / 100,
    avgSpokenScore:
      s.avgSpokenScore != null ? Math.round(s.avgSpokenScore) : null,
    nextReviewDate: s.nextReviewDate?.toISOString() ?? null,
  }));
}