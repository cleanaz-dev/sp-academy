"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

export async function completeVocabBridge(bridgeId: string) {
  try {
    const user = await requireUser();

    if (!bridgeId || typeof bridgeId !== "string") {
      throw new Error("Invalid bridgeId");
    }

    await prisma.foundationBridge.update({
      where: {
        id: bridgeId,
        userId: user.id,
      },
      data: {
        passed: true,
        completedAt: new Date(),
        attempts: { increment: 1 },
        score: 1.0,
      },
    });

    return { ok: true };
  } catch (error) {
    console.error("❌ Failed to complete vocab bridge:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to complete bridge",
    };
  }
}