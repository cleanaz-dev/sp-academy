// app/api/stripe/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const PRICE_IDS: Record<
  string,
  { monthly: string | undefined; annual: string | undefined }
> = {
  founder: {
    monthly: process.env.STRIPE_FOUNDER_PRICE_ID,
    annual:
      process.env.STRIPE_FOUNDER_YEARLY_PRICE_ID ??
      process.env.STRIPE_FOUNDER_PRICE_ID,
  },
  unlimited: {
    monthly: process.env.STRIPE_UNLIMITED_PRICE_ID,
    annual:
      process.env.STRIPE_UNLIMITED_YEARLY_PRICE_ID ??
      process.env.STRIPE_UNLIMITED_PRICE_ID,
  },
};

export async function POST(req: Request) {
  try {
    const { planId, interval = "monthly" } = await req.json();

    const planPrices = PRICE_IDS[planId];
    const resolvedInterval = interval === "annual" ? "annual" : "monthly";
    const price = planPrices?.[resolvedInterval];

    if (!price) {
      return NextResponse.json(
        { error: "Invalid or unconfigured plan" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price, quantity: 1 }],
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      metadata: { planId, interval: resolvedInterval },
      subscription_data: { metadata: { planId, interval: resolvedInterval } },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[STRIPE_CHECKOUT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}