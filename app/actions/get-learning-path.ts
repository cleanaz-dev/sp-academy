"use server";
import { prisma } from "@/lib/prisma";
import { getPresignedImageUrl } from "@/lib/aws/services/s3-presigned-url";

type VisualContent = { imageS3Key?: string; altText?: string; } | null;

async function safePresign(key?: string): Promise<string | null> {
  if (!key) return null;
  try { return await getPresignedImageUrl(key); } 
  catch (err) { return null; }
}

export async function getLearningPath(userId: string) {
  const course = await prisma.foundationCourse.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      targetLanguage: true,
      nativeLanguage: true,
      lessons: {
        orderBy: { orderIndex: "asc" },
        select: {
          visualContent: true, title: true, id: true,
          orderIndex: true, completedAt: true, feedback: true, createdAt: true,
        },
      },
      user: { select: { firstName: true, username: true } },
    },
  });

  if (!course) return null;

  const bridges = await prisma.foundationBridge.findMany({
    where: { foundationCourseId: course.id, userId },
    orderBy: { bridgeIndex: "asc" },
    select: {
      id: true, bridgeIndex: true, vocabMoment: true,
      passed: true, score: true, attempts: true, completedAt: true, createdAt: true,
    },
  });

  const bridgeByIndex = new Map(bridges.map((b) => [b.bridgeIndex, b]));

  const lessons = await Promise.all(
    course.lessons.map(async ({ visualContent, ...lesson }) => {
      const visual = visualContent as unknown as VisualContent;
      return {
        ...lesson,
        imageUrl: await safePresign(visual?.imageS3Key),
        imageAlt: visual?.altText ?? null,
        bridge: bridgeByIndex.get(lesson.orderIndex) ?? null,
      };
    }),
  );

  // --- CALCULATE CURRENT FOCUS & NEXT LOCKED ---
  let currentFocus: { type: "SPOON" | "BRIDGE" | "BOSS", data: typeof lessons[0] } | null = null;
  let nextLocked: { type: "SPOON" | "BRIDGE" | "BOSS", data: typeof lessons[0] } | null = null;

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];

    // 1. Is the Spoon incomplete?
    if (!lesson.completedAt) {
      currentFocus = { type: "SPOON", data: lesson };
      nextLocked = { type: "BRIDGE", data: lesson };
      break;
    }

    // 2. Is the Vocab Bridge pending OR currently generating?
    if (!lesson.bridge || !lesson.bridge.passed) {
      currentFocus = { type: "BRIDGE", data: lesson };
      nextLocked = (lesson.orderIndex % 3 === 0)
        ? { type: "BOSS", data: lesson }
        : (lessons[i + 1] ? { type: "SPOON", data: lessons[i + 1] } : null);
      break;
    }

    // 3. Boss Stage Check (Every 3 Spoons)
    if (lesson.orderIndex % 3 === 0) {
      // TODO: Replace with your actual DB check for Boss Stage completion later
      const isBossPassed = false; 

      if (!isBossPassed) {
        currentFocus = { type: "BOSS", data: lesson };
        nextLocked = lessons[i + 1] ? { type: "SPOON", data: lessons[i + 1] } : null;
        break;
      }
    }
  }

  const wordMatrix = await prisma.languageProfile.findUnique({
    where: { userId_languageCode: { userId, languageCode: course.targetLanguage } },
  });

  return {
    courseId: course.id,
    targetLanguage: course.targetLanguage,
    nativeLanguage: course.nativeLanguage,
    lessons,
    currentFocus, // <-- Used by MiniCards
    nextLocked,   // <-- Used by MiniCards
    user: course.user,
    matrix: wordMatrix
  };
}

export type LearningPath = NonNullable<Awaited<ReturnType<typeof getLearningPath>>>;