import { prisma } from "@/lib/prisma";

export async function isEnrolledInCourse(courseId: string, userId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      courseId,
      user: { id: userId },
    },
  });

  return !!enrollment;
}

export async function isEnrolledInLesson(lessonId: string, userId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      user: { id: userId },
      course: {
        lessons: {
          some: { id: lessonId },
        },
      },
    },
  });

  return !!enrollment;
}