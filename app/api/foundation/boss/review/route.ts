import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { lambda, createCommand } from "@/lib/aws/lambda"; // Uncomment when ready to trigger next milestone

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      sessionId, // This maps to FoundationBossStage.id
      passed,
      xp,
      score,
      duration,
      chancesRemaining,
    } = body;

    console.log(`Boss Session ${sessionId} ended. Passed: ${passed}, Score: ${score}`);

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    // 1. Update the Boss Stage in the database
    const updatedStage = await prisma.foundationBossStage.update({
      where: { id: sessionId },
      data: {
        passed: passed,
        score: score,
        completedAt: passed ? new Date() : undefined, // Only mark completed if they won!
        attempts: { increment: 1 },                   // Track how many tries it took
        results: {                                    // Store stats in the JSON column
          xpAwarded: xp,
          chancesRemaining,
          durationSeconds: duration,
        },
      },
    });

    // 2. (Optional) Award XP to the User Profile
    // await prisma.user.update({
    //   where: { id: updatedStage.userId },
    //   data: { totalXp: { increment: xp } }
    // });

    // 3. IF PASSED: Trigger Lambda to build the NEXT Milestone
    if (passed) {
      console.log(`Milestone ${updatedStage.milestoneIndex} defeated! Ready to build Milestone ${updatedStage.milestoneIndex + 1}...`);
      
      /*
      // This is exactly how you'll queue up the next set of lessons autonomously!
      const nextMilestoneTask = await prisma.systemTask.create({
        data: {
          type: "SPOON_BOSS_GENERATION",
          metadata: {
            userId: updatedStage.userId,
            courseId: updatedStage.foundationCourseId,
            milestoneIndex: updatedStage.milestoneIndex + 1,
          },
        },
      });

      const payload = {
        taskId: nextMilestoneTask.id,
        // ... build your payload for the next milestone ...
      };

      const command = createCommand({
        functionName: process.env.BOSS_BUILDER_LAMBDA_NAME || "spoon-boss-builder",
        payload: JSON.stringify(payload),
        invocationType: "Event", // Async Fire & Forget!
      });

      await lambda.send(command);
      */
    }

    return NextResponse.json({
      success: true,
      message: passed ? "Boss Defeated!" : "Try Again.",
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