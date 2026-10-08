"use server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function completeLesson(input: {
  courseId: string;
  orderIndex: number;
  feedback: "hard" | "ok" | "easy";
}) {
  const user = await requireUser();

  // Idempotent: only the first completion is recorded
  const { count } = await prisma.foundationLesson.updateMany({
    where: {
      foundationCourseId: input.courseId,
      orderIndex: input.orderIndex,
      userId: user.id,
      completedAt: null,
    },
    data: { completedAt: new Date(), feedback: input.feedback },
  });

  return { ok: true, firstTime: count > 0 };
}