// app/actions/complete-vocab-bridge.ts (or wherever completeVocabBridge lives)
"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";
import { triggerMilestoneBossAndNextSpoon } from "@/lib/foundation/trigger-milestone-boss";

export async function completeVocabBridge(bridgeId: string) {
  try {
    const user = await requireUser();

    if (!bridgeId || typeof bridgeId !== "string") {
      throw new Error("Invalid bridgeId");
    }

    // 1. Fetch the bridge details
    const bridge = await prisma.foundationBridge.findUnique({
      where: { id: bridgeId, userId: user.id },
      select: {
        id: true,
        bridgeIndex: true,
        foundationCourseId: true,
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

    // 3. Ensure Boss Stage + Boss Sprite + Next Spoon are baking/ready
    // (Idempotent: if handleVocabBridgeGeneration already started them, this is an instant no-op!)
    if (bridge.bridgeIndex % 3 === 0) {
      await triggerMilestoneBossAndNextSpoon({
        userId: user.id,
        courseId: bridge.foundationCourseId,
        milestoneIndex: bridge.bridgeIndex / 3,
        prebakeNextSpoon: true,
      });
    }

    return { ok: true };
  } catch (error) {
    console.error("❌ Failed to complete vocab bridge:", error);
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to complete bridge",
    };
  }
}