import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new NextResponse("Missing stripe-signature", {
      status: 400,
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_ERROR]", error);

    return new NextResponse("Invalid webhook signature", {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      /**
       * Checkout completed successfully
       */
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        console.log("[STRIPE_CHECKOUT_COMPLETED]", {
          sessionId: session.id,
          customerId: session.customer,
          customerEmail: session.customer_details?.email,
          subscriptionId: session.subscription,
        });

        // TODO:
        // Save the Stripe customer/subscription to your DB.
        //
        // You don't need a Clerk user here yet because
        // the customer hasn't necessarily created an account.

        break;
      }

      /**
       * Subscription created/updated
       */
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        console.log("[STRIPE_SUBSCRIPTION_UPDATED]", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
        });

        // TODO:
        // Update subscription status in your DB.

        break;
      }

      /**
       * Subscription canceled / ended
       */
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        console.log("[STRIPE_SUBSCRIPTION_DELETED]", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });

        // TODO:
        // Remove/revoke access in your DB.

        break;
      }

      /**
       * Payment failed
       */
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        console.log("[STRIPE_PAYMENT_FAILED]", {
          invoiceId: invoice.id,
          customerId: invoice.customer,
        });

        // TODO:
        // Mark subscription/payment as needing attention.

        break;
      }

      default:
        console.log(`[STRIPE_WEBHOOK] Unhandled event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[STRIPE_WEBHOOK_HANDLER_ERROR]", error);

    return new NextResponse("Webhook handler failed", {
      status: 500,
    });
  }
}