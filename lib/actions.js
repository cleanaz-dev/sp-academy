"use server"

import prisma from './prisma';

export async function getLessonById(id) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { Quiz: true }
    });
    return lesson;
  } catch (error) {
    console.error("Failed to fetch lesson:",error);
    return null;
  }
}

export async function getAllLessons(){
  try {
    const lessons = await prisma.lesson.findMany();
    return lessons;
  } catch (error) {
    console.error("Failed to fetch lessons:",error);
    return null;
  }
}