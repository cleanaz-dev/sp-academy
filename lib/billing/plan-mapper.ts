// lib/billing/plan-mapper.ts
import { Billing, BillingInterval } from "@prisma/client";

export function resolvePrismaPlan(
  planId?: string | null,
  interval?: string | null
): { currentPlan: Billing; billingInterval: BillingInterval } {
  const isAnnual = interval === "annual" || interval === "year";

  if (planId === "unlimited") {
    return {
      currentPlan: isAnnual
        ? Billing.PREMIUM_ANNUALLY
        : Billing.PREMIUM_MONTHLY,
      billingInterval: isAnnual
        ? BillingInterval.ANNUALLY
        : BillingInterval.MONTHLY,
    };
  }

  // Default: Founder / Core plan
  return {
    currentPlan: isAnnual
      ? Billing.FOUNDER_ANNUALLY
      : Billing.FOUNDER_MONTHLY,
    billingInterval: isAnnual
      ? BillingInterval.ANNUALLY
      : BillingInterval.MONTHLY,
  };
}