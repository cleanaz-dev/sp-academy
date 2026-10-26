"use server";

import { prisma } from "@/lib/prisma";
import {
  SpriteContextSchema,
  type SpriteFocusWord,
} from "@/lib/schema/sprite-schema";

const MAX_FOCUS_WORDS = 5;

export async function computeSpriteContext(userId: string) {
  try {
    const course = await prisma.foundationCourse.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        nativeLanguage: true,
        targetLanguage: true,
        user: {
          select: {
            firstName: true,
            username: true,
          },
        },
        progress: {
          select: {
            currentSpoon: true,
          },
        },
        lessons: {
          orderBy: { orderIndex: "asc" },
          select: {
            id: true,
            title: true,
            orderIndex: true,
            completedAt: true,
          },
        },
      },
    });

    if (!course) return null;

    // Prefer FoundationProgress, then fall back to the first unfinished lesson.
    // If everything is complete, there is no active lesson.
    const currentLesson =
      course.lessons.find(
        (lesson) =>
          !lesson.completedAt &&
          lesson.orderIndex === course.progress?.currentSpoon
      ) ??
      course.lessons.find((lesson) => !lesson.completedAt) ??
      null;

    const languageProfile = await prisma.languageProfile.findUnique({
      where: {
        userId_languageCode: {
          userId,
          languageCode: course.targetLanguage,
        },
      },
      select: {
        wordStats: {
          select: {
            word: true,
            translation: true,
            status: true,
            masteryScore: true,

            seenCount: true,
            heardCount: true,
            tappedCorrect: true,
            tappedWrong: true,

            spokenAttempts: true,
            avgSpokenScore: true,

            nextReviewDate: true,
            lastSeenAt: true,
            lastHeardAt: true,
            lastTappedAt: true,
            lastSpokenAt: true,
          },
        },
      },
    });

    const stats = languageProfile?.wordStats ?? [];

    // Avoid treating pre-created but never-encountered NEW records as evidence
    // of low mastery.
    const introduced = stats.filter(
      (word) =>
        word.seenCount > 0 ||
        word.heardCount > 0 ||
        word.tappedCorrect + word.tappedWrong > 0 ||
        word.spokenAttempts > 0
    );

    const activityTime = (word: {
      lastSeenAt: Date;
      lastHeardAt: Date | null;
      lastTappedAt: Date | null;
      lastSpokenAt: Date | null;
    }) =>
      Math.max(
        word.lastSeenAt.getTime(),
        word.lastHeardAt?.getTime() ?? 0,
        word.lastTappedAt?.getTime() ?? 0,
        word.lastSpokenAt?.getTime() ?? 0
      );

    // Language-wide mastery baseline over introduced words only.
    const avgMastery =
      introduced.length > 0
        ? Math.round(
            introduced.reduce((sum, word) => sum + word.masteryScore, 0) /
              introduced.length
          )
        : null;

    // Approximate attempt-weighted pronunciation average, so a word with one
    // attempt does not count the same as a word with fifty attempts.
    const scoredSpokenWords = stats.filter(
      (word) => word.spokenAttempts > 0 && word.avgSpokenScore !== null
    );

    const pronunciationAttemptCount = scoredSpokenWords.reduce(
      (sum, word) => sum + word.spokenAttempts,
      0
    );

    const avgPronunciation =
      pronunciationAttemptCount > 0
        ? Math.round(
            scoredSpokenWords.reduce(
              (sum, word) =>
                sum +
                (word.avgSpokenScore ?? 0) * word.spokenAttempts,
              0
            ) / pronunciationAttemptCount
          )
        : null;

    const now = Date.now();

    const focusCandidates = introduced.flatMap((word) => {
      const tappedAttempts = word.tappedCorrect + word.tappedWrong;

      const recognitionAccuracy =
        tappedAttempts > 0
          ? Math.round((word.tappedCorrect / tappedAttempts) * 100)
          : null;

      let reason: SpriteFocusWord["reason"] | null = null;
      let priority = 99;

      if (
        word.nextReviewDate &&
        word.nextReviewDate.getTime() <= now
      ) {
        reason = "due_review";
        priority = 0;
      } else if (
        word.spokenAttempts >= 2 &&
        word.avgSpokenScore !== null &&
        word.avgSpokenScore < 70
      ) {
        reason = "weak_pronunciation";
        priority = 1;
      } else if (
        tappedAttempts >= 3 &&
        recognitionAccuracy !== null &&
        recognitionAccuracy < 70
      ) {
        reason = "low_recognition";
        priority = 2;
      } else if (
        word.status !== "NEW" &&
        word.masteryScore < 60
      ) {
        reason = "low_mastery";
        priority = 3;
      }

      if (!reason) return [];

      const item: SpriteFocusWord = {
        word: word.word,
        translation: word.translation,
        reason,
        masteryScore: Math.round(word.masteryScore),
        recognitionAccuracy,
        pronunciationAverage:
          word.avgSpokenScore === null
            ? null
            : Math.round(word.avgSpokenScore),
        spokenAttempts: word.spokenAttempts,
      };

      return [
        {
          priority,
          activity: activityTime(word),
          item,
        },
      ];
    });

    const focusWords = focusCandidates
      .sort(
        (a, b) =>
          a.priority - b.priority ||
          b.activity - a.activity
      )
      .slice(0, MAX_FOCUS_WORDS)
      .map((candidate) => candidate.item);

    const recentWords = [...introduced]
      .sort((a, b) => activityTime(b) - activityTime(a))
      .slice(0, 3)
      .map((word) => word.word);

    const context = SpriteContextSchema.parse({
      version: 2,

      userName:
        course.user.firstName ||
        course.user.username ||
        "Student",

      nativeLang: course.nativeLanguage,
      targetLang: course.targetLanguage,

      courseId: course.id,
      currentLessonId: currentLesson?.id ?? null,
      currentLessonTitle: currentLesson?.title ?? null,

      avgPronunciation,
      pronunciationWordCount: scoredSpokenWords.length,
      pronunciationAttemptCount,

      avgMastery,
      masteryWordCount: introduced.length,

      focusWords,
      recentWords,

      lastUpdated: new Date().toISOString(),
    });

    await prisma.spriteProfile.update({
      where: { userId },
      data: { context },
    });

    return context;
  } catch (error) {
    console.error("Failed to compute Sprite Context:", error);
    return null;
  }
}

