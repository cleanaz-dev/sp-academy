// lib/spoon-check.ts
import { prisma } from "@/lib/prisma";
import { startOfDay, startOfMonth } from "date-fns";

export async function checkUserSpoonAllowance(userId: string) {
  const [user, billing] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
    prisma.billingInformation.findUnique({
      where: { userId },
      select: { currentPlan: true, isActive: true },
    }),
  ]);

  const isUnlimited = billing?.currentPlan === "PRO_ANNUAL" || (billing as any)?.planId === "unlimited";
  const maxSpoonsPerPeriod = isUnlimited ? 180 : 45; // 60 cycles vs 15 cycles
  const maxDailyConversations = isUnlimited ? 15 : 5;

  const monthStart = startOfMonth(new Date());
  const todayStart = startOfDay(new Date());

  const [spoonsUsedThisMonth, conversationsToday] = await Promise.all([
    prisma.foundationLesson.count({
      where: {
        userId,
        completedAt: { gte: monthStart },
      },
    }),
    prisma.freestyleSession.count({
      where: {
        userId,
        createdAt: { gte: todayStart },
      },
    }),
  ]);

  return {
    canStartSpoon: spoonsUsedThisMonth < maxSpoonsPerPeriod,
    spoonsUsed: spoonsUsedThisMonth,
    maxSpoons: maxSpoonsPerPeriod,

    canStartConversation: conversationsToday < maxDailyConversations,
    conversationsToday,
    maxDailyConversations,

    planTier: isUnlimited ? "UNLIMITED" : "CORE",
  };
}