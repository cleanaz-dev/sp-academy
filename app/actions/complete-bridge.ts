"use server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-guard";

const PASS_THRESHOLD = 0.7;

export type BridgeResult =
  | { ok: true; score: number; correct: number; total: number; passed: boolean }
  | { ok: false; error: string };

export async function completeBridge(
  bridgeId: string,
  results: { itemId: string; correct: boolean }[],
): Promise<BridgeResult> {
  const user = await requireUser();

  const bridge = await prisma.foundationBridge.findFirst({
    where: { id: bridgeId, userId: user.id },
    select: { cooldown: true, passed: true, completedAt: true },
  });
  if (!bridge) return { ok: false, error: "Mini vocab not found." };

  // Only count items that actually belong to this bridge
  const items = (bridge.cooldown as { itemId: string }[] | null) ?? [];
  if (items.length === 0) return { ok: false, error: "No exercises in this set." };

  const valid = new Set(items.map((i) => i.itemId));
  const answers = new Map<string, boolean>();
  for (const r of results) {
    if (valid.has(r.itemId)) answers.set(r.itemId, r.correct);
  }

  const total = items.length;
  const correct = [...answers.values()].filter(Boolean).length;
  const score = correct / total;
  const passed = score >= PASS_THRESHOLD;

  await prisma.foundationBridge.update({
    where: { id: bridgeId },
    data: {
      attempts: { increment: 1 },
      score,
      results: [...answers].map(([itemId, ok]) => ({
        itemId,
        correct: ok,
      })) as Prisma.InputJsonValue,
      // never un-pass a bridge on a later bad retry
      passed: bridge.passed || passed,
      completedAt: passed && !bridge.completedAt ? new Date() : undefined,
    },
  });

  return { ok: true, score, correct, total, passed };
}