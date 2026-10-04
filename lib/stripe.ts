// lib/stripe.ts (server only)
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PRICE_IDS: Record<string, string | undefined> = {
  founder: process.env.STRIPE_FOUNDER_PRICE_ID,
  unlimited: process.env.STRIPE_UNLIMITED_PRICE_ID,
};