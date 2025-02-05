// app/api/webhooks/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

export async function POST(request) {
  const signature = request.headers.get('stripe-signature');
  const payload = await request.text();

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object;
        await handleSubscriptionCreated(subscription);
        break;

      // Add more event handlers as needed
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}

async function handleCheckoutSessionCompleted(session) {
  const userId = session.client_reference_id;
  const planType = session.metadata?.planType;

  // Update user's billing information
  await prisma.billingInformation.upsert({
    where: { userId },
    update: {
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      currentPlan: planType,
      isActive: true,
      nextBillingDate: new Date(session.expires_at * 1000)
    },
    create: {
      userId,
      stripeCustomerId: session.customer,
      stripeSubscriptionId: session.subscription,
      currentPlan: planType,
      isActive: true,
      nextBillingDate: new Date(session.expires_at * 1000)
    }
  });
}

async function handleSubscriptionCreated(subscription) {
  // Additional logic for subscription creation
  // Update user records, send welcome emails, etc.
}