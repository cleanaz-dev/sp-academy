// lib/boss/trigger-boss-generation.ts
import { prisma } from "@/lib/prisma";
import { lambda, createCommand } from "@/lib/aws/lambda";
import { toLanguageCode } from "@/lib/languages";
import { getWordMatrix } from "@/lib/boss/get-word-matrix";
import { buildBossPayload } from "@/lib/boss/build-boss-payload";
import { SpoonBossTaskMetadataSchema } from "@/lib/boss/schemas";

const FUNCTION_NAME =
  process.env.BOSS_BUILDER_LAMBDA_NAME ?? "spoon-boss-builder";
const EVENT_PAYLOAD_LIMIT_BYTES = 256 * 1024;

interface TriggerBossParams {
  courseId: string;
  milestoneIndex: number;
  forceRebuild?: boolean;
}

export async function triggerBossGeneration({
  courseId,
  milestoneIndex,
  forceRebuild = false,
}: TriggerBossParams) {
  // 1. Check if BossStage already exists
  const existing = await prisma.foundationBossStage.findUnique({
    where: {
      foundationCourseId_milestoneIndex: {
        foundationCourseId: courseId,
        milestoneIndex,
      },
    },
  });

  if (existing && !forceRebuild && existing.status !== "FAILED") {
    return { skipped: true, bossStageId: existing.id };
  }

  // 2. Fetch course info
  const course = await prisma.foundationCourse.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      userId: true,
      targetLanguage: true,
      nativeLanguage: true,
    },
  });

  if (!course) {
    throw new Error(`FoundationCourse "${courseId}" not found`);
  }

  const targetLanguage = toLanguageCode(course.targetLanguage);
  const nativeLanguage = toLanguageCode(course.nativeLanguage);

  const startIndex = (milestoneIndex - 1) * 3 + 1;
  const endIndex = milestoneIndex * 3;

  // 3. Fetch slimmed lessons, bridges, and wordMatrix in parallel
  const [lessons, bridges, wordMatrix] = await Promise.all([
    prisma.foundationLesson.findMany({
      where: {
        foundationCourseId: course.id,
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
        foundationCourseId: course.id,
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
    getWordMatrix(course.userId, targetLanguage),
  ]);

  if (lessons.length !== 3 || bridges.length !== 3) {
    throw new Error(
      `Expected 3 lessons and 3 bridges for milestone ${milestoneIndex}, found ${lessons.length} lessons and ${bridges.length} bridges`
    );
  }

  // 4. Upsert the BossStage record
  const bossStage = await prisma.foundationBossStage.upsert({
    where: {
      foundationCourseId_milestoneIndex: {
        foundationCourseId: course.id,
        milestoneIndex,
      },
    },
    create: {
      userId: course.userId,
      foundationCourseId: course.id,
      milestoneIndex,
      targetLessonIds: lessons.map((l) => l.id),
      targetBridgeIds: bridges.map((b) => b.id),
      status: "BUILDING",
    },
    update: {
      targetLessonIds: lessons.map((l) => l.id),
      targetBridgeIds: bridges.map((b) => b.id),
      status: "BUILDING",
    },
  });

  // 5. Validate metadata with our Zod schema before creating SystemTask
  const metadata = SpoonBossTaskMetadataSchema.parse({
    bossStageId: bossStage.id,
    userId: course.userId,
    courseId: course.id,
    milestoneIndex,
  });

  const systemTask = await prisma.systemTask.create({
    data: {
      type: "SPOON_BOSS_GENERATION",
      metadata,
    },
  });

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/webhooks/system-tasks/${systemTask.id}`;

  // 6. Build and verify payload size
  const payload = buildBossPayload({
    taskId: systemTask.id,
    bossStageId: bossStage.id,
    targetLanguage,
    nativeLanguage,
    milestoneIndex,
    lessons,
    bridges,
    wordMatrix,
    webhookUrl,
  });

  const body = JSON.stringify(payload);
  const sizeBytes = Buffer.byteLength(body);

  if (sizeBytes > EVENT_PAYLOAD_LIMIT_BYTES) {
    throw new Error(
      `Boss payload is ${(sizeBytes / 1024).toFixed(1)} KB (exceeds 256 KB Event limit)`
    );
  }

  // 7. Invoke Lambda asynchronously
  const command = createCommand({
    functionName: FUNCTION_NAME,
    invocationType: "Event",
    payload: body,
  });

  await lambda.send(command);

  return {
    skipped: false,
    bossStageId: bossStage.id,
    taskId: systemTask.id,
  };
}