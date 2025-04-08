//api/stripe/create-checkout-session/route.js
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Pricing configuration
const PRICING_PLANS = {
  BASIC_MONTHLY: { priceId: "price_1QobxMFRTGXExwdlneFsnxa6" },
  BASIC_ANNUALLY: { priceId: "price_1QobwmFRTGXExwdloltVmT4v" },
  PREMIUM_MONTHLY: { priceId: "price_1QobzZFRTGXExwdlsdX77DMH" },
  PREMIUM_ANNUALLY: { priceId: "price_1Qoc2aFRTGXExwdlJ8VHL9m4" },
};

export async function POST(request) {
  try {
    // Get the current host dynamically
    const headersList = headers();
    const host = headersList.get("host"); // Gets "localhost:3000" or "yourdomain.com"
    const protocol = host.includes("localhost") ? "http" : "https"; // Use https in production
    const baseUrl = `${protocol}://${host}`;

    // Authenticate user with Clerk
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const { billingPlan } = await request.json();

    // Validate billing plan
    const selectedPlan = PRICING_PLANS[billingPlan];
    if (!selectedPlan) {
      return NextResponse.json(
        { error: "Invalid billing plan" },
        { status: 400 },
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: selectedPlan.priceId, quantity: 1 }],
      success_url: `${baseUrl}/account/billing/success`,
      cancel_url: `${baseUrl}/pricing`,
      client_reference_id: userId,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { clerkUserId: userId, planType: billingPlan },
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session", details: error.message },
      { status: 500 },
    );
  }
}
