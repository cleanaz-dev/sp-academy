//api/quiz/route.js
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateLessonAndCourseProgress } from "@/lib/actions";

export async function POST(request) {
  try {
    // 1. Method validation
    if (request.method !== "POST") {
      return NextResponse.json(
        { message: "Method not allowed" }, 
        { status: 405 }
      );
    }

    // 2. Authentication check
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // 3. Request body validation
    const { quizId, score, lessonId } = await request.json();
    if (!quizId || score === undefined || !lessonId) {
      return NextResponse.json(
        { message: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // 4. Get user from database
    const user = await prisma.user.findFirst({ 
      where: { userId: userId } 
    });
    if (!user) {
      return NextResponse.json(
        { message: "User not found" }, 
        { status: 404 }
      );
    }

    // 5. Get quiz details
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { lesson: true },
    });
    if (!quiz) {
      return NextResponse.json(
        { message: "Quiz not found" }, 
        { status: 404 }
      );
    }

    // 6. Check for existing attempts (optional)
    const existingAttempt = await prisma.quizResult.findFirst({
      where: {
        quizId,
        userId: user.id,
      },
    });

    // 7. Create quiz result
    const quizResult = await prisma.quizResult.create({
      data: {
        quizId,
        userId: user.id,
        score,
        attempts: await prisma.quizResult.count({
          where: {
            quizId,
            userId: user.id,
          }
        }) + 1,
        completedAt: new Date(),
      },
    });

    // If passing score, update progress
    const passingScore = 0.8;
    let progressUpdate = null;
    
    if (score >= passingScore) {
      progressUpdate = await updateLessonAndCourseProgress({
        userId: user.id,
        lessonId,
        courseId: quiz.lesson.courseId,
        score,
      });
    }

    return NextResponse.json({
      message: "Quiz submitted successfully",
      quizResult,
      lessonCompleted: score >= passingScore,
      progressUpdate
    });

  } catch (error) {
    console.error("Error submitting quiz:", error);
    
    // 10. Error handling
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: "Duplicate submission" }, 
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" }, 
      { status: 500 }
    );
  }
}