"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

interface CompleteVocabBridgeParams {
  bridgeId: string;
  score?: number;
  results?: any;
}

export async function completeVocabBridge({
  bridgeId,
  score = 1.0,
  results,
}: CompleteVocabBridgeParams) {
  try {
    const user = await requireUser();

    // Update the bridge and unlock the next lesson
    const updatedBridge = await prisma.foundationBridge.update({
      where: {
        id: bridgeId,
        userId: user.id, // Security check
      },
      data: {
        passed: true,
        completedAt: new Date(),
        attempts: {
          increment: 1,
        },
        score: score ?? 1.0,
        ...(results ? { results } : {}),
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