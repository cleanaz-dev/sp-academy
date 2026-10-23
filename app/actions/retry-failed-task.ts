// app/actions/retry-failed-task.ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { invokeEduBuilder } from "@/app/actions/invoke-edu-builder";
import { triggerMilestoneBossAndNextSpoon } from "@/lib/foundation/trigger-milestone-boss";

export async function retryFailedTask(taskId: string) {
  const user = await requireUser();

  const task = await prisma.systemTask.findUnique({
    where: { id: taskId },
  });

  if (!task) {
    return { ok: false, error: "Task not found" };
  }

  const meta = (task.metadata as Record<string, any>) ?? {};

  // 1. If a Boss Stage failed, re-run triggerMilestoneBossAndNextSpoon
  if (task.type === "SPOON_BOSS_GENERATION") {
    await triggerMilestoneBossAndNextSpoon({
      userId: user.id,
      courseId: meta.courseId,
      milestoneIndex: Number(meta.milestoneIndex || 1),
      prebakeNextSpoon: false,
    });
    return { ok: true };
  }

  // 2. If a Spoon or Vocab Bridge failed, re-run invokeEduBuilder using the saved task payload
  if (task.payload) {
    const savedPayload =
      typeof task.payload === "string"
        ? JSON.parse(task.payload)
        : (task.payload as Record<string, any>);

    // Delete empty placeholder lesson if it never finished baking so setupFirstLesson/setupNextLesson can recreate cleanly
    if (meta.foundationLessonId) {
      const lesson = await prisma.foundationLesson.findUnique({
        where: { id: String(meta.foundationLessonId) },
        select: { title: true },
      });
      if (lesson && !lesson.title) {
        await prisma.foundationLesson
          .delete({ where: { id: String(meta.foundationLessonId) } })
          .catch(() => {});
      }
    }

    return await invokeEduBuilder({
      userId: user.id,
      firstName: savedPayload.firstName || user.firstName || "Learner",
      gender: savedPayload.gender || "M",
      foundationCourseId: savedPayload.foundationCourseId || meta.foundationCourseId,
      spoon: Number(savedPayload.spoon || meta.spoon || 1),
      nativeLanguage: savedPayload.nativeLanguage || "en-US",
      targetLanguage: savedPayload.targetLanguage || "fr-FR",
      levelBand: savedPayload.levelBand || "beginner",
      goal: savedPayload.goal || "general",
      scriptComfort: savedPayload.scriptComfort || "unspecified",
      type: "lang",
      isOnboarding: Boolean(savedPayload.isOnboarding),
      spriteSlug: savedPayload.spriteSlug,
      nativeVoiceId: savedPayload.nativeVoiceId,
      targetVoiceId: savedPayload.targetVoiceId,
    });
  }

  return { ok: false, error: "No payload available to retry" };
}