import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const PRICE_IDS: Record<string, string | undefined> = {
  founder: process.env.STRIPE_FOUNDER_PRICE_ID,
  unlimited: process.env.STRIPE_UNLIMITED_PRICE_ID,
};

export async function POST(req: Request) {
  try {
    const { planId } = await req.json();
    const price = PRICE_IDS[planId];

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
      metadata: { planId },
      subscription_data: { metadata: { planId } },
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