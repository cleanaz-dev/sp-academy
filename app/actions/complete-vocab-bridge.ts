"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { createCommand, lambda } from "@/lib/aws/lambda";

export async function completeVocabBridge(bridgeId: string) {
  try {
    const user = await requireUser();

    if (!bridgeId || typeof bridgeId !== "string") {
      throw new Error("Invalid bridgeId");
    }

    // 1. Fetch the bridge details and include the course to get the languages
    const bridge = await prisma.foundationBridge.findUnique({
      where: { id: bridgeId, userId: user.id },
      include: {
        course: {
          select: {
            targetLanguage: true,
            nativeLanguage: true,
          }
        }
      }
    });

    if (!bridge) throw new Error("Bridge not found");

    // 2. Mark the bridge as passed
    await prisma.foundationBridge.update({
      where: { id: bridgeId },
      data: {
        passed: true,
        completedAt: new Date(),
        attempts: { increment: 1 },
        score: 1.0,
      },
    });

    // --- 3. BOSS STAGE TRIGGER LOGIC ---
    // If this is a 3rd, 6th, 9th bridge...
    if (bridge.bridgeIndex % 3 === 0) {
      const milestoneIndex = bridge.bridgeIndex / 3;

      // Check if a Boss Stage record already exists (idempotency check)
      const existingBossStage = await prisma.foundationBossStage.findUnique({
        where: {
          foundationCourseId_milestoneIndex: {
            foundationCourseId: bridge.foundationCourseId,
            milestoneIndex: milestoneIndex,
          },
        },
      });

      // If it doesn't exist, we need to create it and invoke the Lambda!
      if (!existingBossStage) {
        
        // A. Grab the last 3 Spoons (Fetch EVERYTHING so Lambda has full context)
        const targetLessons = await prisma.foundationLesson.findMany({
          where: {
            foundationCourseId: bridge.foundationCourseId,
            orderIndex: {
              gte: bridge.bridgeIndex - 2,
              lte: bridge.bridgeIndex,
            },
          },
          orderBy: { orderIndex: 'asc' }
        });

        // B. Grab the last 3 Bridges (Fetch EVERYTHING)
        const targetBridges = await prisma.foundationBridge.findMany({
          where: {
            foundationCourseId: bridge.foundationCourseId,
            bridgeIndex: {
              gte: bridge.bridgeIndex - 2,
              lte: bridge.bridgeIndex,
            },
          },
          orderBy: { bridgeIndex: 'asc' }
        });

        // C. Create the pending Boss Stage record
        const newBossStage = await prisma.foundationBossStage.create({
          data: {
            userId: user.id,
            foundationCourseId: bridge.foundationCourseId,
            milestoneIndex: milestoneIndex,
            targetLessonIds: targetLessons.map((l) => l.id),
            targetBridgeIds: targetBridges.map((b) => b.id),
            status: "BUILDING", // Let the UI know it's generating
          },
        });

        // D. Create the System Task
        const systemTask = await prisma.systemTask.create({
          data: {
            type: "SPOON_BOSS_GENERATION",
            metadata: {
              bossStageId: newBossStage.id,
              userId: user.id,
              courseId: bridge.foundationCourseId
            }
          },
        });

        // E. Assemble the complete payload for Lambda
        const payload = {
          taskId: systemTask.id,
          bossStageId: newBossStage.id,
          userId: user.id,
          courseId: bridge.foundationCourseId,
          targetLanguage: bridge.course.targetLanguage,
          nativeLanguage: bridge.course.nativeLanguage,
          milestoneIndex: milestoneIndex,
          // We pass the full data so the Python Lambda doesn't need to query the DB
          lessons: targetLessons,
          bridges: targetBridges,
          // The Lambda will POST back to this URL when it's done processing
          webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/webhooks/system-tasks/${systemTask.id}`
        };

        // F. Send to Lambda
        const command = createCommand({
          functionName: "spoon-boss-builder", // Make sure this matches your deployed AWS Lambda name
          invocationType: "Event", // "Event" means async (fire and forget)
          payload: JSON.stringify(payload)
        });
        
        await lambda.send(command);

        console.log(`🚀 Triggered Boss Stage ${milestoneIndex} generation for task ${systemTask.id}!`);
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("❌ Failed to complete vocab bridge:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to complete bridge",
    };
  }
}