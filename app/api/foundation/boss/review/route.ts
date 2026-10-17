import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { invokeEduBuilder } from "@/app/actions/invoke-edu-builder"; // <-- Your existing robust action!

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
    console.log("Boss Payload:", body)

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

    // // 2. Award Global XP
    // if (xp > 0) {
    //   await prisma.user.update({
    //     where: { id: updatedStage.userId },
    //     data: { totalXp: { increment: xp } }
    //   });
    // }

    // 3. IF PASSED: Use your existing action to build the next Spoon!
    if (passed) {
      const course = updatedStage.course;
      const user = course.user;
      const nextLessonDay = (updatedStage.milestoneIndex * 3) + 1; // e.g., Milestone 1 -> Day 4

      console.log(`Boss Defeated! Prepping payload for Lesson ${nextLessonDay}...`);

      // 3a. Fetch the exact 3 lessons the Boss covered using targetLessonIds
      const pastLessons = await prisma.foundationLesson.findMany({
        where: { id: { in: updatedStage.targetLessonIds } },
        orderBy: { orderIndex: "asc" }, // Order them Day 1, Day 2, Day 3
        select: { title: true, lessonHandoff: true },
      });

      // 3b. Extract the titles so the LLM Router doesn't duplicate topics
      const previousLessonTitles = pastLessons.map(l => l.title);

      // 3c. Extract the vocab from the LAST lesson so the Foundation Builder can inject review words
      let yesterdayWords: string[] = [];
      const lastLessonHandoff = pastLessons[pastLessons.length - 1]?.lessonHandoff as any;
      
      if (lastLessonHandoff) {
         yesterdayWords = lastLessonHandoff.targetPhrases || lastLessonHandoff.words || [];
      }

      // 3d. Invoke YOUR existing Builder Action!
      const result = await invokeEduBuilder({
        userId: user.id,
        firstName: user.firstName || user.name || "Learner",
        gender: user.gender || "N", // Replace if you store M/F
        foundationCourseId: course.id,
        spoon: nextLessonDay, // The "Day" number
        nativeLanguage: course.nativeLanguage,
        targetLanguage: course.targetLanguage,
        levelBand: "beginner",
        goal: "travel",
        scriptComfort: "script",
        type: "lang",
        isOnboarding: false, // Ensures LLM Router is used
        previous_lessons: previousLessonTitles,
        yesterdayAttempted: yesterdayWords,
        yesterdayLanded: yesterdayWords, // They beat the boss, so they landed them!
      });

      if (!result.ok) {
        console.error("❌ Failed to queue next lesson:", result.error);
      } else {
        console.log(`✅ Next lesson (${nextLessonDay}) successfully queued for generation!`);
      }
    }

    return NextResponse.json({
      success: true,
      message: passed ? "Boss Defeated! Next milestone queued." : "Try Again.",
      stage: updatedStage
    });

  } catch (error) {
    console.error("Boss Review Route Error:", error);
    return NextResponse.json(
      { error: "Failed to process boss results" },
      { status: 500 }
    );
  }
}