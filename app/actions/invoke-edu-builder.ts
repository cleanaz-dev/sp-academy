"use server";
import { lambda, createCommand } from "@/lib/aws/lambda";
import { prisma } from "@/lib/prisma";
import { JsonValue } from "@prisma/client/runtime/library";
import { setupFirstLesson } from "@/lib/foundation/setup-first-lesson";
import { setupNextLesson } from "@/lib/foundation/setup-next-lesson";
import Stripe from "stripe";
import { Billing, BillingInterval, PaymentStatus } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// --- TYPE DEFINITIONS ---
export interface InvokeEduBuilderPayload {
  userId: string;
  firstName: string;
  gender: string;
  foundationCourseId?: string;
  spoon: number;
  nativeLanguage: string;
  targetLanguage: string;
  levelBand: string;
  goal: string;
  scriptComfort: string;
  type: string;
  isOnboarding: boolean;
  previous_lessons?: JsonValue[];
  sessionId?: string;

  // NEW: Sprite fields from onboarding
  spriteSlug?: "vox" | "vivi";
  nativeVoiceId?: string;
  targetVoiceId?: string;

  yesterdayAttempted?: string[];
  yesterdayLanded?: string[];
}

export type InvokeEduBuilderResult =
  | { ok: true; lessonId: string; taskId: string }
  | { ok: false; error: string };

export interface LessonDbContext {
  courseId: string;
  lessonId: string;
  taskId: string;
  vocabTaskId: string;
  spriteTaskId: string;
  spriteProfileId: string;
  webhookUrl: string;
  vocabWebhookUrl: string;
  spriteWebhookUrl: string;
}

function normalizeGender(g?: string | null): "M" | "F" | "N" {
  if (!g) return "N";
  const upper = g.trim().toUpperCase();
  if (upper === "M" || upper === "MALE") return "M";
  if (upper === "F" || upper === "FEMALE") return "F";
  return "N";
}

/**
 * Reassigns the Stripe subscription from the temporary webhook user
 * to the actual user who just finished onboarding.
 */
async function claimSubscriptionForUser(userId: string, sessionId?: string) {
  if (!sessionId) return;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (!customerId && !subscriptionId) return;

    // Find the billing row created by the webhook
    const existingBilling = await prisma.billingInformation.findFirst({
      where: {
        OR: [
          ...(subscriptionId ? [{ stripeSubscriptionId: subscriptionId }] : []),
          ...(customerId ? [{ stripeCustomerId: customerId }] : []),
        ],
      },
    });

    if (existingBilling) {
      if (existingBilling.userId !== userId) {
        const oldUserId = existingBilling.userId;

        // 1. Move billing to the active user who just finished onboarding
        await prisma.billingInformation.update({
          where: { id: existingBilling.id },
          data: { userId },
        });

        // 2. Clean up the orphaned filler user if it was only a placeholder
        const oldUser = await prisma.user.findUnique({
          where: { id: oldUserId },
          include: { accounts: true, sessions: true },
        });

        if (
          oldUser &&
          oldUser.accounts.length === 0 &&
          oldUser.sessions.length === 0
        ) {
          await prisma.user.delete({ where: { id: oldUserId } }).catch(() => {});
        }

        console.log(
          `✅ Subscription transferred from ${oldUserId} to ${userId}`,
        );
      }
    } else {
      // Fallback: If webhook was delayed and hasn't arrived yet, create billing now
      let interval = BillingInterval.MONTHLY;
      let nextBillingDate: Date | null = null;
      let cancelAtPeriodEnd = false;

      if (subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const subItem = sub.items.data[0];

        // Safe cast to avoid TypeScript errors across different Stripe SDK versions
        const periodEnd =
          (sub as any).current_period_end ??
          (subItem as any)?.current_period_end;

        if (periodEnd) nextBillingDate = new Date(periodEnd * 1000);
        if (subItem?.price.recurring?.interval === "year")
          interval = BillingInterval.MONTHLY;
        cancelAtPeriodEnd = sub.cancel_at_period_end;
      }

      await prisma.billingInformation.upsert({
        where: { userId },
        create: {
          userId,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          currentPlan: Billing.PRO_MONTHLY,
          billingInterval: interval,
          isActive: true,
          cancelAtPeriodEnd,
          paymentStatus: PaymentStatus.PAID,
          nextBillingDate,
          lastPaymentDate: new Date(),
        },
        update: {
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          isActive: true,
        },
      });

      console.log(`✅ Subscription created on-the-fly for ${userId}`);
    }
  } catch (error) {
    console.error("❌ Failed to claim subscription:", error);
  }
}

export async function invokeEduBuilder(
  payload: InvokeEduBuilderPayload,
): Promise<InvokeEduBuilderResult> {
  // 0. Link the subscription to this user immediately
  if (payload.sessionId) {
    await claimSubscriptionForUser(payload.userId, payload.sessionId);
  }

  // Normalize gender upfront so setupFirstLesson / setupNextLesson stores "M" | "F" | "N"
  const normalizedPayload: InvokeEduBuilderPayload = {
    ...payload,
    gender: normalizeGender(payload.gender),
  };

  // 1. DB setup
  let dbContext: LessonDbContext;
  try {
    dbContext = normalizedPayload.isOnboarding
      ? await setupFirstLesson(normalizedPayload)
      : await setupNextLesson(normalizedPayload);
  } catch (error) {
    console.error("❌ Lesson setup failed:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Setup failed",
    };
  }

  // =========================================================================
  // AUTOMATICALLY FETCH HISTORICAL CONTEXT & RECOVER USER PROFILE FOR LAMBDA
  // =========================================================================
  let previous_lessons: any[] = [];
  let yesterdayLanded: string[] = [];

  // Calculate which 3-Spoon Milestone & Sub-Step (1, 2, or 3) this Spoon belongs to
  const milestoneIndex = Math.ceil(normalizedPayload.spoon / 3);
  const milestoneSubStep = ((normalizedPayload.spoon - 1) % 3) + 1; // 1, 2, or 3

  let resolvedLevelBand = normalizedPayload.levelBand;
  let resolvedGoal = normalizedPayload.goal;
  let resolvedGender = normalizeGender(normalizedPayload.gender);
  let resolvedFirstName = normalizedPayload.firstName;

  if (!normalizedPayload.isOnboarding && dbContext.courseId) {
    const [pastLessons, firstTask] = await Promise.all([
      prisma.foundationLesson.findMany({
        where: {
          foundationCourseId: dbContext.courseId,
          id: { not: dbContext.lessonId }, // Exclude the empty lesson we just created
        },
        orderBy: { orderIndex: "asc" },
        select: { orderIndex: true, title: true, lessonHandoff: true },
      }),

      // Recover onboarding profile from Spoon 1's SystemTask if returning user call omitted them
      prisma.systemTask.findFirst({
        where: {
          type: "SPOON_GENERATION",
          metadata: {
            path: ["foundationCourseId"],
            equals: dbContext.courseId,
          },
        },
        orderBy: { createdAt: "asc" },
        select: { payload: true },
      }),
    ]);

    previous_lessons = pastLessons.map((l) => {
      const { wordAudio, wordLexicon, ...cleanHandoff } =
        (l.lessonHandoff as Record<string, any>) || {};
      return {
        day: l.orderIndex,
        theme: l.title || cleanHandoff.theme || "",
        ...cleanHandoff,
      };
    });

    // 2. Extract the exact words they learned in the very last lesson
    if (pastLessons.length > 0) {
      const lastHandoff = pastLessons[pastLessons.length - 1]
        .lessonHandoff as any;
      if (lastHandoff) {
        yesterdayLanded =
          lastHandoff.taughtChunks ||
          lastHandoff.targetPhrases ||
          lastHandoff.words ||
          [];
      }
    }

    // 3. Recover onboarding levelBand, goal, gender, firstName from Spoon 1's task payload
    if (firstTask?.payload) {
      try {
        const initialData =
          typeof firstTask.payload === "string"
            ? JSON.parse(firstTask.payload)
            : (firstTask.payload as Record<string, any>);

        if (!resolvedLevelBand || resolvedLevelBand === "unspecified") {
          resolvedLevelBand = initialData.levelBand || "beginner";
        }
        if (!resolvedGoal || resolvedGoal === "unspecified") {
          resolvedGoal = initialData.goal || "general";
        }
        if (resolvedGender === "N" && initialData.gender) {
          resolvedGender = normalizeGender(initialData.gender);
        }
        if (!resolvedFirstName || resolvedFirstName === "Learner") {
          resolvedFirstName = initialData.firstName || resolvedFirstName;
        }
      } catch (e) {
        console.warn("Could not parse initial task payload:", e);
      }
    }
  }
  // =========================================================================

  // 2. Lambda payload wrapped in { body }
  const lambdaPayload = {
    ...normalizedPayload,
    type: "lang",
    day: normalizedPayload.spoon,
    milestoneIndex,
    subStep: milestoneSubStep,
    foundationCourseId: dbContext.courseId,
    foundationLessonId: dbContext.lessonId,
    webhookUrl: dbContext.webhookUrl,
    vocabWebhookUrl: dbContext.vocabWebhookUrl,
    levelBand: resolvedLevelBand || "beginner",
    goal: resolvedGoal || "general",
    gender: resolvedGender,
    firstName: resolvedFirstName || "there",

    // Inject the historical data directly overriding anything empty
    previous_lessons:
      previous_lessons.length > 0
        ? previous_lessons
        : normalizedPayload.previous_lessons,
    yesterdayAttempted:
      yesterdayLanded.length > 0
        ? yesterdayLanded
        : normalizedPayload.yesterdayAttempted,
    yesterdayLanded:
      yesterdayLanded.length > 0
        ? yesterdayLanded
        : normalizedPayload.yesterdayLanded,
  };

  try {
    const response = await lambda.send(
      createCommand({
        functionName: "spoon-edu-builder",
        payload: { body: JSON.stringify(lambdaPayload) },
        invocationType: "Event",
      }),
    );

    if (response.StatusCode !== 202) {
      throw new Error(`Unexpected lambda status: ${response.StatusCode}`);
    }

    return { ok: true, lessonId: dbContext.lessonId, taskId: dbContext.taskId };
  } catch (error) {
    console.error("❌ Error invoking Lambda:", error);

    // Clean up tasks on failure so retry works
    await prisma.systemTask
      .updateMany({
        where: { id: { in: [dbContext.taskId, dbContext.vocabTaskId] } },
        data: { status: "FAILED" },
      })
      .catch((e) => console.error("Could not mark tasks failed", e));

    await prisma.foundationLesson
      .delete({ where: { id: dbContext.lessonId } })
      .catch((e) => console.error("Could not delete empty lesson", e));

    return {
      ok: false,
      error: "Could not start the next lesson. Please try again.",
    };
  }
}