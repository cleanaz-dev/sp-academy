"use server"

import prisma from "@/lib/prisma"

export async function getLessonById(lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: {id: lessonId}
  })
  return lesson
}