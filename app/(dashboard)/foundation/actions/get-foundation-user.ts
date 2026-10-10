"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface GetUserFoundationParams {
  userId: string;
  lessonId: string;
  courseId: string;
}

// 1. Exact Prisma Payload Type (includes course, bridge, and user)
export type UserFoundation = Prisma.FoundationLessonGetPayload<{
  include: {
    course: {
      select: {
        id: true;
        nativeLanguage: true;
        targetLanguage: true;
        outline: true;
      };
    };
    foundationBridge: true;
    user: {
      select: {
        firstName: true;
        name: true;
      };
    };
  };
}>;

// 2. Function return type
export type GetUserFoundationResult = UserFoundation | null;

export async function getUserFoundation({
  userId,
  lessonId,
  courseId,
}: GetUserFoundationParams): Promise<GetUserFoundationResult> {
  const foundation = await prisma.foundationLesson.findFirst({
    where: {
      id: lessonId,
      foundationCourseId: courseId,
      userId: userId,
    },
    include: {
      course: {
        select: {
          id: true,
          nativeLanguage: true,
          targetLanguage: true,
          outline: true,
        },
      },
      foundationBridge: true,
      user: {
        select: {
          firstName: true,
          name: true,
        },
      },
    },
  });

  return foundation;
}