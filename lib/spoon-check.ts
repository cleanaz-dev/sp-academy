// lib/spoon-check.ts
import { prisma } from "@/lib/prisma";
import { startOfDay, startOfMonth } from "date-fns";
import { Billing, PaymentStatus } from "@prisma/client";

export type UserPlanTier = "UNLIMITED" | "CORE" | "INACTIVE";

export async function checkUserSpoonAllowance(userId: string) {
  const [user, billing] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    }),
    prisma.billingInformation.findUnique({
      where: { userId },
      select: {
        currentPlan: true,
        isActive: true,
        paymentStatus: true,
      },
    }),
  ]);

  const isAdmin = user?.role === "ADMIN";

  const isPaidAndActive =
    Boolean(billing?.isActive) &&
    billing?.paymentStatus !== PaymentStatus.CANCELED &&
    billing?.paymentStatus !== PaymentStatus.UNPAID;

  // Unlimited+ Tier ($125/mo or $1,188/yr)
  const isUnlimited =
    billing?.currentPlan === Billing.PREMIUM_MONTHLY ||
    billing?.currentPlan === Billing.PREMIUM_ANNUALLY;

  // Founder / Core Tier ($35/mo or $348/yr, plus legacy PRO/BASIC aliases)
  const isCore =
    billing?.currentPlan === Billing.FOUNDER_MONTHLY ||
    billing?.currentPlan === Billing.FOUNDER_ANNUALLY ||
    billing?.currentPlan === Billing.PRO_MONTHLY ||
    billing?.currentPlan === Billing.PRO_ANNUALLY ||
    billing?.currentPlan === Billing.BASIC_MONTHLY ||
    billing?.currentPlan === Billing.BASIC_ANNUALLY;

  let planTier: UserPlanTier = "INACTIVE";
  if (isAdmin || (isPaidAndActive && isUnlimited)) {
    planTier = "UNLIMITED";
  } else if (isPaidAndActive && isCore) {
    planTier = "CORE";
  }

  // 15 cycles (45 spoons) on Core vs 60 cycles (180 spoons) on Unlimited+
  const maxSpoonsPerPeriod = isAdmin ? 9999 : planTier === "UNLIMITED" ? 180 : planTier === "CORE" ? 45 : 0;
  // 5 AI chats/day on Core vs 15 on Unlimited+
  const maxDailyConversations = isAdmin ? 999 : planTier === "UNLIMITED" ? 15 : planTier === "CORE" ? 5 : 0;

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
    isSubscribed: planTier !== "INACTIVE",
    planTier,

    // Spoon Quota
    canStartSpoon: isAdmin || (planTier !== "INACTIVE" && spoonsUsedThisMonth < maxSpoonsPerPeriod),
    spoonsUsed: spoonsUsedThisMonth,
    maxSpoons: maxSpoonsPerPeriod,
    spoonsRemaining: Math.max(0, maxSpoonsPerPeriod - spoonsUsedThisMonth),

    // Standalone Conversation AI Quota
    canStartConversation: isAdmin || (planTier !== "INACTIVE" && conversationsToday < maxDailyConversations),
    conversationsToday,
    maxDailyConversations,
    conversationsRemaining: Math.max(0, maxDailyConversations - conversationsToday),
  };
}