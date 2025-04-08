// app/api/courses/progress/update/route.js

import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, lessonId, courseId } = await req.json();

    // Validate required fields
    if (!userId || !lessonId || !courseId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    console.log("All data: ", userId, lessonId, courseId);

    // Get user
    const user = await prisma.user.findFirst({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Get or create enrollment
      let enrollment = await tx.enrollment.findFirst({
        where: {
          userId: user.id,
          courseId,
        },
      });

      if (!enrollment) {
        enrollment = await tx.enrollment.create({
          data: {
            userId: user.id,
            courseId,
            status: "IN_PROGRESS",
            progress: 0,
          },
        });
      }

      // 2. Update or create progress
      const progress = await tx.progress.upsert({
        where: {
          userId_lessonId: {
            userId: user.id,
            lessonId,
          },
        },
        update: {
          status: "IN_PROGRESS",
          updatedAt: new Date(),
          enrollmentId: enrollment.id,
        },
        create: {
          userId: user.id,
          lessonId,
          status: "IN_PROGRESS",
          enrollmentId: enrollment.id,
        },
      });

      // 3. Calculate new course progress
      const totalLessons = await tx.lesson.count({
        where: { courseId },
      });

      const completedLessons = await tx.progress.count({
        where: {
          userId: user.id,
          enrollment: {
            courseId,
          },
          status: "COMPLETED",
        },
      });

      const overallProgress = Math.round(
        (completedLessons / totalLessons) * 100,
      );

      // 4. Update enrollment with new progress
      const updatedEnrollment = await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progress: overallProgress,
          lastAccessedAt: new Date(),
        },
      });

      return {
        progress,
        enrollment: updatedEnrollment,
        overallProgress,
      };
    });

    // Return updated progress information
    return NextResponse.json({
      success: true,
      progressUpdate: {
        lessonProgress: result.progress,
        courseProgress: result.overallProgress,
        enrollment: result.enrollment,
      },
    });
  } catch (error) {
    console.error("Error updating progress:", error);

    // Handle specific errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Progress already exists" },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");

    if (!userId || !courseId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId,
      },
      include: {
        lessonProgress: true,
      },
    });

    return NextResponse.json({
      success: true,
      enrollment,
      progress: enrollment?.progress || 0,
      lessonProgress: enrollment?.lessonProgress || [],
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
