// lib/sprites/build-dossier.ts
// Builds the v2 sprite dossier (the AI compute context) on the SERVER from the DB.
// The client no longer sends it, so client and server can't drift.

import { prisma } from "@/lib/prisma";

export type FocusReason =
  | "due_review"
  | "weak_pronunciation"
  | "low_recognition"
  | "low_mastery";

export type DossierV2 = {
  version: 2;
  userName: string;
  nativeLang: string;
  targetLang: string;
  courseId: string;
  currentLessonId: string;
  currentLessonTitle: string;
  topWord: string | null;
  topPhrase: {
    word: string;
    translation: string | null;
    partOfSpeech: string;
    spokenAttempts: number;
    avgSpokenScore: number | null;
    seenCount: number;
    status: string;
  } | null;
  recentWords: string[];
  focusWords: {
    word: string;
    translation: string | null;
    reason: FocusReason;
    masteryScore: number;
    recognitionAccuracy: number | null; // 0-100, null = no taps yet
    pronunciationAverage: number | null; // 0-100, null = never spoken
    spokenAttempts: number;
  }[];
  pronunciationWordCount: number;
  pronunciationAttemptCount: number;
  avgPronunciation: number | null; // null = not enough data (not zero ability)
  avgMastery: number | null; // null = not enough data
  masteryWordCount: number;
  lastUpdated: string;
};

export class DossierUnavailableError extends Error {}

// Used when there is no FoundationProgress row.
// 1) Active bridge = first unpassed bridge after the last passed one
//    (this is what the Learning Hub shows as "Vocab Bridge N ready").
// 2) Else IN_PROGRESS lesson, 3) else lesson after the last completed one.
async function pickActiveLesson(courseId: string) {
  const bridges = await prisma.foundationBridge.findMany({
    where: { foundationCourseId: courseId },
    orderBy: { bridgeIndex: "asc" },
    select: {
      bridgeIndex: true,
      passed: true,
      lesson: { select: { id: true, title: true, orderIndex: true } },
    },
  });

  const lastPassed = Math.max(
    -1,
    ...bridges.filter((b) => b.passed).map((b) => b.bridgeIndex)
  );
  const activeBridge = bridges.find(
    (b) => !b.passed && b.bridgeIndex > lastPassed
  );

  if (activeBridge) {
    console.log("[buildDossier] lesson picked", {
      source: "active_bridge",
      bridgeIndex: activeBridge.bridgeIndex,
      lastPassedBridge: lastPassed,
      lesson: activeBridge.lesson,
    });
    return activeBridge.lesson;
  }

  const lessons = await prisma.foundationLesson.findMany({
    where: { foundationCourseId: courseId },
    orderBy: { orderIndex: "asc" },
    select: {
      id: true,
      title: true,
      orderIndex: true,
      status: true,
      completedAt: true,
    },
  });
  if (!lessons.length) return null;

  const inProgress = lessons.find((l) => l.status === "IN_PROGRESS");
  if (inProgress) {
    console.log("[buildDossier] lesson picked", {
      source: "in_progress",
      lesson: inProgress.title,
    });
    return inProgress;
  }

  const done = lessons.filter((l) => l.status === "COMPLETED" || l.completedAt);
  const lastDone = done.length
    ? Math.max(...done.map((l) => l.orderIndex))
    : -1;

  const next =
    lessons.find((l) => l.orderIndex > lastDone) ??
    lessons[lessons.length - 1];

  console.log("[buildDossier] lesson picked", {
    source: "after_last_completed",
    lastCompletedOrderIndex: lastDone,
    lesson: next.title,
  });
  return next;
}

const WEAK_PRONUNCIATION_BELOW = 70;

export async function buildDossier(userId: string): Promise<DossierV2> {
  const [user, spriteProfile, progress] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, firstName: true },
    }),
    prisma.spriteProfile.findUnique({
      where: { userId },
      select: { nativeLanguage: true, targetLanguage: true },
    }),
    prisma.foundationProgress.findUnique({
      where: { userId },
      select: { foundationCourseId: true, currentSpoon: true },
    }),
  ]);

  console.log("[buildDossier] lookup", {
    userId,
    hasUser: !!user,
    hasSpriteProfile: !!spriteProfile,
    hasFoundationProgress: !!progress,
    spriteLangs: spriteProfile
      ? [spriteProfile.nativeLanguage, spriteProfile.targetLanguage]
      : null,
    progress: progress ?? null,
  });

  if (!user) throw new DossierUnavailableError("No user row");
  if (!spriteProfile) {
    throw new DossierUnavailableError("No SpriteProfile row for this user");
  }

  const { nativeLanguage, targetLanguage } = spriteProfile;

  // Course: prefer FoundationProgress, else the user's most recent course
  const courseId =
    progress?.foundationCourseId ??
    (
      await prisma.foundationCourse.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      })
    )?.id;

  if (!courseId) {
    throw new DossierUnavailableError("No FoundationCourse for this user");
  }

  // Lesson: progress.currentSpoon if we have it, else the active lesson,
  // else the first lesson in the course
  const lessonSelect = { id: true, title: true, orderIndex: true } as const;

  const lesson =
    (progress
      ? await prisma.foundationLesson.findUnique({
          where: {
            foundationCourseId_orderIndex: {
              foundationCourseId: courseId,
              orderIndex: progress.currentSpoon,
            },
          },
          select: lessonSelect,
        })
      : null) ??
    (await pickActiveLesson(courseId));

  if (!lesson) {
    throw new DossierUnavailableError(
      `Course ${courseId} has no lessons yet`
    );
  }

  const stats = await prisma.wordStat.findMany({
    where: {
      languageProfile: { userId, languageCode: targetLanguage },
    },
    select: {
      word: true,
      wordType: true,
      translation: true,
      partOfSpeech: true,
      seenCount: true,
      tappedCorrect: true,
      tappedWrong: true,
      spokenAttempts: true,
      avgSpokenScore: true,
      masteryScore: true,
      status: true,
      nextReviewDate: true,
      lastSeenAt: true,
    },
  });

  const words = stats.filter((s) => s.wordType === "WORD");
  const phrases = stats.filter((s) => s.wordType === "PHRASE");

  const bySeen = (a: { seenCount: number }, b: { seenCount: number }) =>
    b.seenCount - a.seenCount;

  const topWord = [...words].sort(bySeen)[0]?.word ?? null;
  const topPhraseRow = [...phrases].sort(bySeen)[0];

  const recentWords = [...stats]
    .sort((a, b) => b.lastSeenAt.getTime() - a.lastSeenAt.getTime())
    .slice(0, 4)
    .map((s) => s.word);

  // Pronunciation
  const spoken = stats.filter(
    (s) => s.spokenAttempts > 0 && s.avgSpokenScore !== null
  );
  const pronunciationAttemptCount = spoken.reduce(
    (n, s) => n + s.spokenAttempts,
    0
  );
  const avgPronunciation = spoken.length
    ? Math.round(
        spoken.reduce((n, s) => n + (s.avgSpokenScore as number), 0) /
          spoken.length
      )
    : null;

  // Mastery (only words the user has actually seen)
  const seen = stats.filter((s) => s.seenCount > 0);
  const avgMastery = seen.length
    ? Math.round(seen.reduce((n, s) => n + s.masteryScore, 0) / seen.length)
    : null;

  // Focus words: first matching reason wins, weakest first, max 5
  const now = new Date();
  const focusWords = seen
    .filter((s) => s.status !== "MASTERED")
    .map((s) => {
      let reason: FocusReason | null = null;
      if (s.nextReviewDate && s.nextReviewDate <= now) reason = "due_review";
      else if (
        s.spokenAttempts > 0 &&
        s.avgSpokenScore !== null &&
        s.avgSpokenScore < WEAK_PRONUNCIATION_BELOW
      )
        reason = "weak_pronunciation";
      else if (s.tappedWrong > s.tappedCorrect) reason = "low_recognition";
      else if (s.status === "NEW" || s.status === "LEARNING")
        reason = "low_mastery";
      return reason ? { s, reason } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.s.masteryScore - b.s.masteryScore)
    .slice(0, 5)
    .map(({ s, reason }) => {
      const taps = s.tappedCorrect + s.tappedWrong;
      return {
        word: s.word,
        translation: s.translation,
        reason,
        masteryScore: s.masteryScore,
        recognitionAccuracy: taps
          ? Math.round((s.tappedCorrect / taps) * 100)
          : null,
        pronunciationAverage:
          s.spokenAttempts > 0 && s.avgSpokenScore !== null
            ? Math.round(s.avgSpokenScore)
            : null,
        spokenAttempts: s.spokenAttempts,
      };
    });

  return {
    version: 2,
    userName: user.firstName ?? user.name,
    nativeLang: nativeLanguage,
    targetLang: targetLanguage,
    courseId,
    currentLessonId: lesson.id,
    currentLessonTitle: lesson.title ?? `Spoon ${lesson.orderIndex}`,
    topWord,
    topPhrase: topPhraseRow
      ? {
          word: topPhraseRow.word,
          translation: topPhraseRow.translation,
          partOfSpeech: topPhraseRow.partOfSpeech,
          spokenAttempts: topPhraseRow.spokenAttempts,
          avgSpokenScore: topPhraseRow.avgSpokenScore,
          seenCount: topPhraseRow.seenCount,
          status: topPhraseRow.status,
        }
      : null,
    recentWords,
    focusWords,
    pronunciationWordCount: spoken.length,
    pronunciationAttemptCount,
    avgPronunciation,
    avgMastery,
    masteryWordCount: seen.length,
    lastUpdated: new Date().toISOString(),
  };
}