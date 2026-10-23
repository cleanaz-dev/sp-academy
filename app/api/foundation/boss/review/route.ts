import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invokeEduBuilder } from "@/app/actions/invoke-edu-builder";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId, // BossStage ID
      passed,
      xp,
      score,
      duration,
      chancesRemaining,
    } = body;

    console.log(`Boss Session ${sessionId} ended. Passed: ${passed}`);
    console.log("Boss Payload:", body);

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    // 1. Update Boss Stage and grab all the related data we need
    const updatedStage = await prisma.foundationBossStage.update({
      where: { id: sessionId },
      data: {
        passed: passed,
        score: score,
        completedAt: passed ? new Date() : undefined,
        attempts: { increment: 1 },
        results: { xpAwarded: xp, chancesRemaining, durationSeconds: duration },
      },
      include: {
        course: { include: { user: true } },
      },
    });

    // 2. IF PASSED: Ensure the next Spoon is either already pre-baked OR queue it now as a fallback!
    if (passed) {
      const course = updatedStage.course;
      const user = course.user;
      const nextLessonDay = updatedStage.milestoneIndex * 3 + 1; // e.g., Milestone 1 -> Day 4

      // Check if triggerMilestoneBossAndNextSpoon already pre-baked (or is baking) this Spoon
      const existingNextSpoon = await prisma.foundationLesson.findUnique({
        where: {
          foundationCourseId_orderIndex: {
            foundationCourseId: course.id,
            orderIndex: nextLessonDay,
          },
        },
        select: { id: true, title: true },
      });

      if (existingNextSpoon) {
        console.log(
          `⚡ Boss Defeated! Lesson ${nextLessonDay} (${existingNextSpoon.id}) is already pre-baked/baking!`
        );
      } else {
        console.log(
          `Boss Defeated! Pre-bake not found—queuing Lesson ${nextLessonDay} now...`
        );

        const pastLessons = await prisma.foundationLesson.findMany({
          where: { id: { in: updatedStage.targetLessonIds } },
          orderBy: { orderIndex: "asc" },
          select: { title: true, lessonHandoff: true },
        });

        const previousLessonTitles = pastLessons.map((l) => l.title);

        let yesterdayWords: string[] = [];
        const lastLessonHandoff = pastLessons[pastLessons.length - 1]
          ?.lessonHandoff as any;

        if (lastLessonHandoff) {
          yesterdayWords =
            lastLessonHandoff.targetPhrases || lastLessonHandoff.words || [];
        }

        const result = await invokeEduBuilder({
          userId: user.id,
          firstName: user.firstName || user.name || "Learner",
          gender: user.gender || "N",
          foundationCourseId: course.id,
          spoon: nextLessonDay,
          nativeLanguage: course.nativeLanguage,
          targetLanguage: course.targetLanguage,
          levelBand: "unspecified", // Auto-recovered from Spoon 1 inside invokeEduBuilder
          goal: "unspecified",      // Auto-recovered from Spoon 1 inside invokeEduBuilder
          scriptComfort: "script",
          type: "lang",
          isOnboarding: false,
          previous_lessons: previousLessonTitles,
          yesterdayAttempted: yesterdayWords,
          yesterdayLanded: yesterdayWords,
        });

        if (!result.ok) {
          console.error("❌ Failed to queue next lesson:", result.error);
        } else {
          console.log(
            `✅ Next lesson (${nextLessonDay}) successfully queued for generation!`
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: passed ? "Boss Defeated! Next milestone ready." : "Try Again.",
      stage: updatedStage,
    });
  } catch (error) {
    console.error("Boss Review Route Error:", error);
    return NextResponse.json(
      { error: "Failed to process boss results" },
      { status: 500 }
    );
  }
}