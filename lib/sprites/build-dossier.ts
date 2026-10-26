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
  }[];
  pronunciationWordCount: number;
  pronunciationAttemptCount: number;
  avgPronunciation: number | null; // null = not enough data (not zero ability)
  avgMastery: number | null; // null = not enough data
  masteryWordCount: number;
  lastUpdated: string;
};

export class DossierUnavailableError extends Error {}

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

  if (!user || !spriteProfile || !progress) {
    throw new DossierUnavailableError(
      "Missing user, sprite profile, or foundation progress"
    );
  }

  const { nativeLanguage, targetLanguage } = spriteProfile;

  const lesson = await prisma.foundationLesson.findUnique({
    where: {
      foundationCourseId_orderIndex: {
        foundationCourseId: progress.foundationCourseId,
        orderIndex: progress.currentSpoon,
      },
    },
    select: { id: true, title: true },
  });

  if (!lesson) {
    throw new DossierUnavailableError(
      `No lesson at orderIndex ${progress.currentSpoon}`
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
    ? Math.round(
        (seen.reduce((n, s) => n + s.masteryScore, 0) / seen.length) * 100
      ) / 100
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
    .map(({ s, reason }) => ({
      word: s.word,
      translation: s.translation,
      reason,
    }));

  return {
    version: 2,
    userName: user.firstName ?? user.name,
    nativeLang: nativeLanguage,
    targetLang: targetLanguage,
    courseId: progress.foundationCourseId,
    currentLessonId: lesson.id,
    currentLessonTitle: lesson.title ?? `Spoon ${progress.currentSpoon}`,
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