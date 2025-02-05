//api/stripe/subscribe/route.js
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Initialize Prisma
const prisma = new PrismaClient();

// Stripe Price IDs (replace with your actual Stripe Price IDs)
const STRIPE_PRICE_IDS = {
  FREE: null,
  BASIC_MONTHLY: 'prod_Ri21GqcyGeIrcO',
  BASIC_ANNUALLY: 'prod_Ri20dUVvH0cIVb',
  PREMIUM_MONTHLY: 'prod_Ri237rPeJUiMmK',
  PREMIUM_ANNUALLY: 'prod_Ri269FHJtLW7So',
};

// Billing Plans Configuration
const BILLING_PLANS = {
  FREE: {
    name: 'Free Plan',
    price: 0,
    features: [
      'Basic Access',
      'Limited Daily Practice',
      'Standard AI Interactions'
    ]
  },
  BASIC_MONTHLY: {
    name: 'Basic Monthly',
    price: 9.99,
    billingInterval: 'MONTHLY',
    features: [
      'All Free Plan Features',
      'Unlimited Daily Practice',
      'Advanced AI Interactions',
      'Progress Tracking'
    ]
  },
  BASIC_ANNUALLY: {
    name: 'Basic Annually',
    price: 99.99,
    billingInterval: 'ANNUALLY',
    savings: 19.89,
    features: [
      'All Basic Monthly Features',
      'Save 20% Annually',
      'Priority Support'
    ]
  },
  PREMIUM_MONTHLY: {
    name: 'Premium Monthly',
    price: 19.99,
    billingInterval: 'MONTHLY',
    features: [
      'All Basic Plan Features',
      'Personalized Learning Paths',
      'Expert Tutoring',
      'Advanced Analytics'
    ]
  },
  PREMIUM_ANNUALLY: {
    name: 'Premium Annually',
    price: 199.99,
    billingInterval: 'ANNUALLY',
    savings: 39.89,
    features: [
      'All Premium Monthly Features',
      'Save 25% Annually',
      'Dedicated Support',
      'Exclusive Workshops'
    ]
  }
};

export async function POST(request) {
  try {
    // Authenticate with Clerk
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      billingPlan, 
      paymentMethodId, 
      billingInterval 
    } = body;

    // Validate input
    if (!billingPlan || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Handle Free Plan
    if (billingPlan === 'FREE') {
      const updatedUser = await prisma.billingInformation.upsert({
        where: { userId },
        update: {
          currentPlan: 'FREE',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          isActive: true,
          billingInterval: 'MONTHLY'
        },
        create: {
          userId,
          currentPlan: 'FREE',
          billingInterval: 'MONTHLY',
          isActive: true
        }
      });

      return NextResponse.json({ 
        message: 'Switched to Free Plan',
        plan: 'FREE'
      });
    }

    // Validate billing plan
    const priceId = STRIPE_PRICE_IDS[billingPlan];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid billing plan' }, 
        { status: 400 }
      );
    }

    // Fetch user's email from Clerk
    const user = await clerkClient.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found' }, 
        { status: 400 }
      );
    }

    // Create Stripe Customer
    const customer = await stripe.customers.create({
      payment_method: paymentMethodId,
      email: userEmail,
      metadata: {
        clerkUserId: userId,
        planType: billingPlan
      }
    });

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Create Subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ 
        price: priceId 
      }],
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent']
    });

    // Update Billing Information in Database
    const billingInfo = await prisma.billingInformation.upsert({
      where: { userId },
      update: {
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        currentPlan: billingPlan,
        billingInterval: billingInterval,
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        isActive: true,
        paymentStatus: 'PAID'
      },
      create: {
        userId,
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
        currentPlan: billingPlan,
        billingInterval: billingInterval,
        nextBillingDate: new Date(subscription.current_period_end * 1000),
        isActive: true,
        paymentStatus: 'PAID'
      }
    });

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscriptionId: subscription.id,
      plan: billingPlan,
      billingInterval
    });

  } catch (error) {
    console.error('Subscription creation error:', error);

    // Handle specific error types
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { 
          error: 'Payment processing failed', 
          details: error.message 
        }, 
        { status: 402 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Subscription creation failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

// Optional: Add GET method to retrieve current subscription
export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const billingInfo = await prisma.billingInformation.findUnique({
      where: { userId }
    });

    if (!billingInfo) {
      return NextResponse.json(
        { message: 'No billing information found', plan: 'FREE' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      plan: billingInfo.currentPlan,
      billingInterval: billingInfo.billingInterval,
      nextBillingDate: billingInfo.nextBillingDate,
      isActive: billingInfo.isActive
    });

  } catch (error) {
    console.error('Error retrieving billing information:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve billing information' }, 
      { status: 500 }
    );
  }
}