"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { createCommand, lambda } from "@/lib/aws/lambda";
import { toLanguageCode } from "@/lib/languages";
import { getWordMatrix } from "@/lib/boss/get-word-matrix";
import { buildBossPayload } from "@/lib/boss/build-boss-payload";
import { SpoonBossTaskMetadataSchema } from "@/lib/boss/schemas";

const FUNCTION_NAME =
  process.env.BOSS_BUILDER_LAMBDA_NAME ?? "spoon-boss-builder";
const EVENT_PAYLOAD_LIMIT_BYTES = 256 * 1024;

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
          },
        },
      },
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

      // Check if a Boss Stage record already exists
      const existingBossStage = await prisma.foundationBossStage.findUnique({
        where: {
          foundationCourseId_milestoneIndex: {
            foundationCourseId: bridge.foundationCourseId,
            milestoneIndex,
          },
        },
      });

      // Trigger if it doesn't exist yet, or if a previous attempt FAILED
      if (!existingBossStage || existingBossStage.status === "FAILED") {
        const targetLanguage = toLanguageCode(bridge.course.targetLanguage);
        const nativeLanguage = toLanguageCode(bridge.course.nativeLanguage);

        const startIndex = bridge.bridgeIndex - 2;
        const endIndex = bridge.bridgeIndex;

        // A. Fetch only the required columns for the 3 lessons, 3 bridges, plus wordMatrix
        const [targetLessons, targetBridges, wordMatrix] = await Promise.all([
          prisma.foundationLesson.findMany({
            where: {
              foundationCourseId: bridge.foundationCourseId,
              orderIndex: { gte: startIndex, lte: endIndex },
            },
            orderBy: { orderIndex: "asc" },
            select: {
              id: true,
              title: true,
              orderIndex: true,
              lessonHandoff: true,
              grammarContent: true,
              freestyle: true,
            },
          }),

          prisma.foundationBridge.findMany({
            where: {
              foundationCourseId: bridge.foundationCourseId,
              bridgeIndex: { gte: startIndex, lte: endIndex },
            },
            orderBy: { bridgeIndex: "asc" },
            select: {
              id: true,
              foundationLessonId: true,
              bridgeIndex: true,
              vocabMoment: true,
              handoffFragment: true,
            },
          }),

          getWordMatrix(user.id, targetLanguage),
        ]);

        if (targetLessons.length !== 3 || targetBridges.length !== 3) {
          throw new Error(
            `Expected 3 lessons and 3 bridges for milestone ${milestoneIndex} ` +
              `(indices ${startIndex}-${endIndex}), found ${targetLessons.length} lessons and ${targetBridges.length} bridges.`
          );
        }

        // B. Upsert the Boss Stage record (handles both brand-new and retrying FAILED stages)
        const bossStage = await prisma.foundationBossStage.upsert({
          where: {
            foundationCourseId_milestoneIndex: {
              foundationCourseId: bridge.foundationCourseId,
              milestoneIndex,
            },
          },
          create: {
            userId: user.id,
            foundationCourseId: bridge.foundationCourseId,
            milestoneIndex,
            targetLessonIds: targetLessons.map((l) => l.id),
            targetBridgeIds: targetBridges.map((b) => b.id),
            status: "BUILDING",
          },
          update: {
            targetLessonIds: targetLessons.map((l) => l.id),
            targetBridgeIds: targetBridges.map((b) => b.id),
            status: "BUILDING",
            scenarioData: undefined,
          },
        });

        // C. Validate metadata with Zod & create the System Task
        const metadata = SpoonBossTaskMetadataSchema.parse({
          bossStageId: bossStage.id,
          userId: user.id,
          courseId: bridge.foundationCourseId,
          milestoneIndex,
        });

        const systemTask = await prisma.systemTask.create({
          data: {
            type: "SPOON_BOSS_GENERATION",
            metadata,
          },
        });

        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/system-tasks/${systemTask.id}`;

        // D. Assemble the slimmed payload via buildBossPayload
        const payload = buildBossPayload({
          taskId: systemTask.id,
          bossStageId: bossStage.id,
          targetLanguage,
          nativeLanguage,
          milestoneIndex,
          lessons: targetLessons,
          bridges: targetBridges,
          wordMatrix,
          webhookUrl,
        });

        const body = JSON.stringify(payload);
        const sizeBytes = Buffer.byteLength(body);

        if (sizeBytes > EVENT_PAYLOAD_LIMIT_BYTES) {
          throw new Error(
            `Boss payload is ${(sizeBytes / 1024).toFixed(1)} KB, exceeding the 256 KB async Event limit.`
          );
        }

        // E. Invoke Lambda asynchronously
        const command = createCommand({
          functionName: FUNCTION_NAME,
          invocationType: "Event",
          payload: body,
        });

        await lambda.send(command);

        console.log(
          `🚀 Triggered Boss Stage ${milestoneIndex} (${(sizeBytes / 1024).toFixed(1)} KB) for task ${systemTask.id}!`
        );
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