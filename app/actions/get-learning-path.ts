"use server";
import { prisma } from "@/lib/prisma";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });

type VisualContent = { imageS3Key?: string; altText?: string } | null;

async function signImage(key?: string) {
  if (!key) return null;
  // If you serve through CloudFront, replace this whole function with:
  // return `${process.env.CDN_URL}/${key}`;
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }),
    { expiresIn: 60 * 60 }
  );
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
      const visual = visualContent as VisualContent;
      return {
        ...lesson,
        imageUrl: await signImage(visual?.imageS3Key),
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
  };
}

export type LearningPath = NonNullable<
  Awaited<ReturnType<typeof getLearningPath>>
>;