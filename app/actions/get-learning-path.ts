"use server"
import { prisma } from "@/lib/prisma";

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
          id: true,
          orderIndex: true,
          completedAt: true,
          feedback: true,
          createdAt: true,
        },
      },
    },
  });

  if (!course) return null;

  // Bridges are fetched separately and matched by bridgeIndex === lesson.orderIndex.
  // wordAudio and cooldown are skipped on purpose (big JSON); the vocab page loads them.
  const bridges = await prisma.foundationBridge.findMany({
    where: { foundationCourseId: course.id, userId },
    orderBy: { bridgeIndex: "asc" },
    select: {
      id: true,
      bridgeIndex: true,
      vocabMoment: true,
      passed: true,
      score: true,
      attempts: true,
      completedAt: true,
      createdAt: true,
    },
  });

  const bridgeByIndex = new Map(bridges.map((b) => [b.bridgeIndex, b]));

  return {
    courseId: course.id,
    targetLanguage: course.targetLanguage,
    nativeLanguage: course.nativeLanguage,
    lessons: course.lessons.map((lesson) => ({
      ...lesson,
      bridge: bridgeByIndex.get(lesson.orderIndex) ?? null,
    })),
  };
}

export type LearningPath = NonNullable<Awaited<ReturnType<typeof getLearningPath>>>;