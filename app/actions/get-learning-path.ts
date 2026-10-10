"use server";
import { prisma } from "@/lib/prisma";
import { getPresignedImageUrl } from "@/lib/aws/services/s3-presigned-url";

type VisualContent = {
  imageS3Key?: string;
  altText?: string;
} | null;

// Your helper throws on an empty key, so guard it here.
// Also catch errors so one bad image doesn't break the whole learning path.
async function safePresign(key?: string): Promise<string | null> {
  if (!key) return null;
  try {
    return await getPresignedImageUrl(key);
  } catch (err) {
    console.error("[getLearningPath] presign failed for", key, err);
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
      user: {
        select: {
          firstName: true,
          username: true
        }
      }
    },
  });

  if (!course) return null;

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

  const lessons = await Promise.all(
    course.lessons.map(async ({ visualContent, ...lesson }) => {
      const visual = visualContent as unknown as VisualContent;
      return {
        ...lesson,
        imageUrl: await safePresign(visual?.imageS3Key),
        imageAlt: visual?.altText ?? null,
        bridge: bridgeByIndex.get(lesson.orderIndex) ?? null,
      };
    })
  );

  return {
    courseId: course.id,
    targetLanguage: course.targetLanguage,
    nativeLanguage: course.nativeLanguage,
    lessons,
    user: course.user,
  };
}

export type LearningPath = NonNullable<
  Awaited<ReturnType<typeof getLearningPath>>
>;