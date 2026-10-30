// app/actions/sprite-energy.ts
"use server";

import { prisma } from "@/lib/prisma";

/**
 * Spends 1 Energy charge to unlock a bonus Chalkboard session while Vox is resting.
 */
export async function spendSpriteEnergy(userId: string): Promise<{
  ok: boolean;
  energy: number;
  message?: string;
}> {
  const profile = await prisma.spriteProfile.findUnique({
    where: { userId },
    select: { id: true, energy: true },
  });

  if (!profile || profile.energy <= 0) {
    return {
      ok: false,
      energy: 0,
      message: "No energy charges left! Complete a Boss streak or Sprite Exercise to recharge.",
    };
  }

  const updated = await prisma.spriteProfile.update({
    where: { id: profile.id },
    data: { energy: { decrement: 1 } },
    select: { energy: true },
  });

  return { ok: true, energy: updated.energy };
}

/**
 * Awards +1 Energy charge (capped at maxEnergy) after a Boss 3-streak or Sprite Exercise completion.
 */
export async function awardSpriteEnergy(
  userId: string,
  amount = 1
): Promise<{ ok: boolean; energy: number }> {
  const profile = await prisma.spriteProfile.findUnique({
    where: { userId },
    select: { id: true, energy: true, maxEnergy: true },
  });

  if (!profile) return { ok: false, energy: 0 };

  const nextEnergy = Math.min(profile.maxEnergy, profile.energy + amount);

  const updated = await prisma.spriteProfile.update({
    where: { id: profile.id },
    data: { energy: nextEnergy },
    select: { energy: true },
  });

  return { ok: true, energy: updated.energy };
}