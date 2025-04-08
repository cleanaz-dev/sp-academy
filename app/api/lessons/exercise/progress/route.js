//api/lessons/exercise/progress/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request) {
  try {
    const { userId } = auth();
    const { exerciseIds } = await request.json();

    // 1. Get user and exercises
    const user = await prisma.user.findFirst({
      where: { userId: userId },
      include: { Enrollment: true },
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    // 2. Update exercises
    await prisma.exercise.updateMany({
      where: { id: { in: exerciseIds } },
      data: { completed: true },
    });

    // 3. Get associated lesson from first exercise
    const firstExercise = await prisma.exercise.findFirst({
      where: { id: exerciseIds[0] },
      select: { lessonId: true },
    });

    if (!firstExercise?.lessonId) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    // 4. Check if all lesson exercises are completed
    const lesson = await prisma.lesson.findUnique({
      where: { id: firstExercise.lessonId },
      include: { exercise: true },
    });

    const allExercisesCompleted = lesson.exercise.every(
      (e) => exerciseIds.includes(e.id) || e.completed,
    );

    // 5. Update lesson progress if all exercises completed
    if (allExercisesCompleted) {
      // Update or create progress record
      await prisma.progress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId: lesson.id,
          },
        },
        update: {
          status: "COMPLETED",
          score: 100,
          completedAt: new Date(),
        },
        create: {
          userId: user.id,
          lessonId: lesson.id,
          status: "COMPLETED",
          score: 100,
          completedAt: new Date(),
        },
      });

      // 6. Update enrollment progress
      const totalLessons = await prisma.lesson.count({
        where: { courseId: lesson.courseId },
      });

      const completedLessons = await prisma.progress.count({
        where: {
          userId: user.id,
          status: "COMPLETED",
          lesson: { courseId: lesson.courseId },
        },
      });

      const newProgress = (completedLessons / totalLessons) * 100;

      await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: lesson.courseId,
          },
        },
        data: {
          progress: newProgress,
          updatedAt: new Date(),
          ...(newProgress === 100 ? { completedAt: new Date() } : {}),
        },
      });
    }

    return new NextResponse(
      { success: true, lessonId: lesson.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating progress:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
