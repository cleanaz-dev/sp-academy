"use server";
import { prisma } from "@/lib/prisma";
import { getPresignedImageUrl } from "@/lib/aws/services/s3-presigned-url";

type VisualContent = { imageS3Key?: string; altText?: string } | null;
type BossScenarioData = {
  title?: string;
  setting?: string;
  description?: string;
  aiRole?: string;
  objective?: string;
  coverUrl?: string;
  coverS3Key?: string;
  imageS3Key?: string;
} | null;

async function safePresign(key?: string | null): Promise<string | null> {
  if (!key) return null;
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  try {
    return await getPresignedImageUrl(key);
  } catch (err) {
    return null;
  }
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
          visualContent: true,
          title: true,
          id: true,
          orderIndex: true,
          completedAt: true,
          feedback: true,
          createdAt: true,
        },
      },
      user: { select: { firstName: true, username: true } },
    },
  });

  if (!course) return null;

  // 1. Fetch Bridges
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

  // 2. Fetch Boss Stages
  const bossStages = await prisma.foundationBossStage.findMany({
    where: { foundationCourseId: course.id, userId },
    select: {
      id: true,
      milestoneIndex: true,
      status: true,
      passed: true,
      targetLessonIds: true,
      targetBridgeIds: true,
      scenarioData: true,
      completedAt: true,
    },
  });

  const resolvedBossStages = await Promise.all(
    bossStages.map(async (b) => {
      const scenario = b.scenarioData as unknown as BossScenarioData;
      const rawCover =
        (b as any).coverUrl ??
        (b as any).coverS3Key ??
        scenario?.coverUrl ??
        scenario?.coverS3Key ??
        scenario?.imageS3Key ??
        null;

      return {
        ...b,
        coverUrl: await safePresign(rawCover),
      };
    })
  );

  const bossByMilestoneIndex = new Map(
    resolvedBossStages.map((b) => [b.milestoneIndex, b])
  );

  // 3. Map everything into the Lessons array
  const lessons = await Promise.all(
    course.lessons.map(async ({ visualContent, ...lesson }) => {
      const visual = visualContent as unknown as VisualContent;
      const isMilestone = lesson.orderIndex % 3 === 0;
      const milestoneIndex = isMilestone ? lesson.orderIndex / 3 : null;

      return {
        ...lesson,
        imageUrl: await safePresign(visual?.imageS3Key),
        imageAlt: visual?.altText ?? null,
        bridge: bridgeByIndex.get(lesson.orderIndex) ?? null,
        bossStage: milestoneIndex
          ? (bossByMilestoneIndex.get(milestoneIndex) ?? null)
          : null,
      };
    })
  );

  // 4. Calculate Current Focus & Next Locked
  let currentFocus: {
    type: "SPOON" | "BRIDGE" | "BOSS";
    data: (typeof lessons)[0];
  } | null = null;
  let nextLocked: {
    type: "SPOON" | "BRIDGE" | "BOSS";
    data: (typeof lessons)[0];
  } | null = null;

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];

    if (!lesson.completedAt) {
      currentFocus = { type: "SPOON", data: lesson };
      nextLocked = { type: "BRIDGE", data: lesson };
      break;
    }

    if (!lesson.bridge || !lesson.bridge.passed) {
      currentFocus = { type: "BRIDGE", data: lesson };
      nextLocked =
        lesson.orderIndex % 3 === 0
          ? { type: "BOSS", data: lesson }
          : lessons[i + 1]
            ? { type: "SPOON", data: lessons[i + 1] }
            : null;
      break;
    }

    if (lesson.orderIndex % 3 === 0) {
      const boss = lesson.bossStage;
      if (!boss || boss.status === "BUILDING" || !boss.passed) {
        currentFocus = { type: "BOSS", data: lesson };
        nextLocked = lessons[i + 1]
          ? { type: "SPOON", data: lessons[i + 1] }
          : null;
        break;
      }
    }
  }

  const wordMatrix = await prisma.languageProfile.findUnique({
    where: {
      userId_languageCode: { userId, languageCode: course.targetLanguage },
    },
  });

  return {
    courseId: course.id,
    targetLanguage: course.targetLanguage,
    nativeLanguage: course.nativeLanguage,
    lessons,
    currentFocus,
    nextLocked,
    user: course.user,
    matrix: wordMatrix,
  };
}

export type LearningPath = NonNullable<
  Awaited<ReturnType<typeof getLearningPath>>
>;