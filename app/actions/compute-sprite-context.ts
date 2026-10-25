// app/actions/compute-sprite-context.ts
"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

// 1. Strict schema so the AI always gets exactly what it expects
export const SpriteContextSchema = z.object({
  userName: z.string().default("Student"),
  nativeLang: z.string().default("English"),
  targetLang: z.string().default("French"),
  currentLessonTitle: z.string().default("Basics"),
  topWord: z.string().nullable(),
  recentWords: z.string().default(""),
  avgPronunciation: z.number().default(0),
  avgMastery: z.number().default(0),
  lastUpdated: z.string().datetime(),
});

export type SpriteAIContext = z.infer<typeof SpriteContextSchema>;

export async function computeSpriteContext(userId: string) {
  try {
    // 1. Get user & active course
    const course = await prisma.foundationCourse.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        lessons: {
          orderBy: { orderIndex: "asc" },
          select: { title: true, completedAt: true, id: true },
        },
      },
    });

    if (!course) return null;

    // 2. Find their exact current focus
    const currentLesson = course.lessons.find((l) => !l.completedAt) || course.lessons[course.lessons.length - 1];

    // 3. Get Word Matrix Stats (Heavy Query, done in background)
    const wordMatrix = await prisma.languageProfile.findUnique({
      where: { userId_languageCode: { userId, languageCode: course.targetLanguage } },
      include: {
        wordStats: {
          orderBy: [{ spokenAttempts: "desc" }, { lastSeenAt: "desc" }],
        },
      },
    });

    const allStats = wordMatrix?.wordStats ?? [];
    const topWord = allStats.find((w) => w.wordType === "WORD");
    const recentWords = allStats.slice(0, 3).map((w) => w.word).join(", ");
    
    const spokenItems = allStats.filter((w) => w.spokenAttempts > 0 && w.avgSpokenScore != null);
    const avgPronunciation = spokenItems.length > 0
      ? Math.round(spokenItems.reduce((sum, w) => sum + (w.avgSpokenScore ?? 0), 0) / spokenItems.length)
      : 0;

    const avgMastery = allStats.length > 0
      ? Math.round(allStats.reduce((sum, w) => sum + (w.masteryScore ?? 0), 0) / allStats.length)
      : 0;

    // 4. Build the validated JSON payload
    const rawContext = {
      userName: course.user.firstName || course.user.username || "Student",
      nativeLang: course.nativeLanguage,
      targetLang: course.targetLanguage,
      currentLessonTitle: currentLesson?.title || "Basics",
      topWord: topWord?.word || null,
      recentWords,
      avgPronunciation,
      avgMastery,
      lastUpdated: new Date().toISOString(),
    };

    const validatedContext = SpriteContextSchema.parse(rawContext);

    // 5. Save it to the Materialized View
    await prisma.spriteProfile.update({
      where: { userId },
      data: { context: validatedContext },
    });

    return validatedContext;
  } catch (error) {
    console.error("Failed to compute Sprite Context:", error);
    return null;
  }
}