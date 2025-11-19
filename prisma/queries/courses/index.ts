"use server";

import prisma from "@/lib/prisma";

export async function getCourseById(id: string) {
  const course = await prisma.course.findFirst({
    where: { id: id },
    include: {
      lessons: true,
    },
  });
  return course;
}

export async function isEnrolled(courseId: string, userId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      user: { userId: userId },
      courseId: courseId,
    },
  });
  return !!enrollment;
}

export async function getAllCoursesByUserId(userId: string) {
  return await prisma.course.findMany({
    where: {
      enrollments: { some: { user: { userId } } },
    },
    include: {
      enrollments: true,
      lessons: true,
      teacher: true,
    },
    orderBy: { createdAt: "desc" },
  });
}