import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma"; // Adjust this import if your prisma client is exported elsewhere
import { Billing, BillingInterval, PaymentStatus } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Maps Stripe Price IDs to your Prisma Billing enum.
 */
function getBillingPlan(priceId?: string): Billing {
  switch (priceId) {
    case process.env.STRIPE_FOUNDER_MONTHLY_PRICE_ID:
      return Billing.FOUNDER_MONTHLY;

    case process.env.STRIPE_PRO_MONTHLY_PRICE_ID:
      return Billing.PRO_MONTHLY;

    default:
      return Billing.FREE;
  }
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_VERIFY_ERROR]", error);
    return new NextResponse("Invalid webhook signature", { status: 400 });
  }

  try {
    switch (event.type) {
      /**
       * 1. Checkout session completed (User successfully bought a plan)
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const email = session.customer_details?.email;
        const name =
          session.customer_details?.name ||
          email?.split("@")[0] ||
          "New Customer";

        if (!email) {
          console.error("[STRIPE_WEBHOOK] No customer email in session", session.id);
          return new NextResponse("Customer email missing", { status: 400 });
        }

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        let interval: BillingInterval = BillingInterval.MONTHLY;
        let nextBillingDate: Date | null = null;
        let cancelAtPeriodEnd = false;
        let currentPlan: Billing = Billing.FREE;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const subItem = subscription.items.data[0];

          // Safe lookup for current_period_end across Stripe API versions
          const currentPeriodEnd =
            (subscription as any).current_period_end ??
            (subItem as any)?.current_period_end;

          if (currentPeriodEnd) {
            nextBillingDate = new Date(currentPeriodEnd * 1000);
          }

          if (subItem?.price.recurring?.interval === "year") {
            interval = BillingInterval.MONTHLY; // Switch to your ANNUAL enum if you add annual billing
          }

          cancelAtPeriodEnd = subscription.cancel_at_period_end;
          currentPlan = getBillingPlan(subItem?.price.id);
        }

        // A. Upsert User (creates filler user if they don't exist yet)
        const user = await prisma.user.upsert({
          where: { email },
          update: {
            // Keep existing user fields intact if they already had an account
          },
          create: {
            email,
            name,
            emailVerified: false,
          },
        });

        // B. Upsert BillingInformation attached to user.id
        await prisma.billingInformation.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            currentPlan,
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
            currentPlan,
            billingInterval: interval,
            isActive: true,
            cancelAtPeriodEnd,
            paymentStatus: PaymentStatus.PAID,
            nextBillingDate,
            lastPaymentDate: new Date(),
          },
        });

        break;
      }

      /**
       * 2. Subscription renewed, changed, or scheduled for cancellation
       */
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const subItem = subscription.items.data[0];

        const currentPeriodEnd =
          (subscription as any).current_period_end ??
          (subItem as any)?.current_period_end;

        const nextBillingDate = currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000)
          : null;

        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing";

        const currentPlan = isActive
          ? getBillingPlan(subItem?.price.id)
          : Billing.FREE;

        // Find billing row by Stripe subscription or customer ID
        const billingInfo = await prisma.billingInformation.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscription.id },
              { stripeCustomerId: subscription.customer as string },
            ],
          },
        });

        if (billingInfo) {
          await prisma.billingInformation.update({
            where: { id: billingInfo.id },
            data: {
              isActive,
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
              currentPlan,
              nextBillingDate,
              paymentStatus: isActive
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            },
          });
        }
        break;
      }

      /**
       * 3. Subscription deleted / revoked access
       */
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const billingInfo = await prisma.billingInformation.findFirst({
          where: {
            OR: [
              { stripeSubscriptionId: subscription.id },
              { stripeCustomerId: subscription.customer as string },
            ],
          },
        });

        if (billingInfo) {
          await prisma.billingInformation.update({
            where: { id: billingInfo.id },
            data: {
              isActive: false,
              currentPlan: Billing.FREE,
              stripeSubscriptionId: null,
              cancelAtPeriodEnd: false,
              paymentStatus: PaymentStatus.UNPAID,
            },
          });
        }
        break;
      }

      /**
       * 4. Recurring invoice payment failed
       */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const billingInfo = await prisma.billingInformation.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (billingInfo) {
          await prisma.billingInformation.update({
            where: { id: billingInfo.id },
            data: {
              paymentStatus: PaymentStatus.UNPAID,
            },
          });
        }
        break;
      }

      default:
        console.log(`[STRIPE_WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_HANDLER_ERROR]", error);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }
}