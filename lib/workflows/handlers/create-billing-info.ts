// lib/workflows/handlers/create-billing-info.ts

import prisma from "@/lib/prisma";



type CreateBillingInfoParams = {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
};

export async function createBillingInfo({
  userId,
  stripeCustomerId,
  stripeSubscriptionId,
}: CreateBillingInfoParams) {
  return prisma.billingInformation.create({
    data: {
      userId,
      stripeCustomerId,
      stripeSubscriptionId,
      currentPlan: "PREMIUM_MONTHLY",
      paymentStatus: "PAID",
      isActive: true,
    },
  });
}