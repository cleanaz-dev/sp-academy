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
}

export type InvokeEduBuilderResult =
  | { ok: true; lessonId: string; taskId: string }
  | { ok: false; error: string };

export interface LessonDbContext {
  courseId: string;
  lessonId: string;
  taskId: string;
  vocabTaskId: string;
  webhookUrl: string;
  vocabWebhookUrl: string;
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

        if (oldUser && oldUser.accounts.length === 0 && oldUser.sessions.length === 0) {
          await prisma.user.delete({ where: { id: oldUserId } }).catch(() => {});
        }

        console.log(`✅ Subscription transferred from ${oldUserId} to ${userId}`);
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
        if (subItem?.price.recurring?.interval === "year") interval = BillingInterval.MONTHLY;
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

  // 1. DB setup
  let dbContext: LessonDbContext;
  try {
    dbContext = payload.isOnboarding
      ? await setupFirstLesson(payload)
      : await setupNextLesson(payload);
  } catch (error) {
    console.error("❌ Lesson setup failed:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Setup failed",
    };
  }

  // 2. Lambda payload wrapped in { body }
  const lambdaPayload = {
    ...payload,
    type: "lang",
    day: payload.spoon,
    foundationCourseId: dbContext.courseId,
    foundationLessonId: dbContext.lessonId,
    webhookUrl: dbContext.webhookUrl,
    vocabWebhookUrl: dbContext.vocabWebhookUrl,
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