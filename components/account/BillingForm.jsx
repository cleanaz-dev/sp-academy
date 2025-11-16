"use client";

import React, { useState } from "react";
import { Button } from "@/components/old-ui/button";
import { Label } from "@/components/old-ui/label";
import { Card } from "@/components/old-ui/card";
import { toast } from "sonner"; // Assuming you're using sonner for toasts
import { loadStripe } from "@stripe/stripe-js";
import { CheckCircle, XCircle } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

export function BillingForm({ currentBillingPlan }) {
  const [billingPlan, setBillingPlan] = useState(currentBillingPlan || "FREE");
  const [billingInterval, setBillingInterval] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const planDetails = {
    FREE: {
      name: "Free Plan",
      price: 0,
      features: [
        { text: "Access to basic features", included: true },
        { text: "Limited AI conversations", included: true },
        { text: "Basic reading logs", included: true },
        { text: "Priority support", included: false },
        { text: "Advanced analytics", included: false },
      ],
    },
    BASIC_MONTHLY: {
      name: "Basic Monthly",
      price: 9.99,
      savings: 0,
      features: [
        { text: "Unlimited AI conversations", included: true },
        { text: "Advanced reading logs", included: true },
        { text: "Priority support", included: true },
        { text: "Advanced analytics", included: false },
        { text: "Custom AI voices", included: false },
      ],
    },
    BASIC_ANNUALLY: {
      name: "Basic Annually",
      price: 99.99,
      savings: 19.89,
      features: [
        { text: "Unlimited AI conversations", included: true },
        { text: "Advanced reading logs", included: true },
        { text: "Priority support", included: true },
        { text: "Advanced analytics", included: false },
        { text: "Custom AI voices", included: false },
      ],
    },
    PREMIUM_MONTHLY: {
      name: "Premium Monthly",
      price: 19.99,
      features: [
        { text: "Unlimited AI conversations", included: true },
        { text: "Advanced reading logs", included: true },
        { text: "Priority support", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Custom AI voices", included: true },
      ],
    },
    PREMIUM_ANNUALLY: {
      name: "Premium Annually",
      price: 199.99,
      savings: 39.89,
      features: [
        { text: "Unlimited AI conversations", included: true },
        { text: "Advanced reading logs", included: true },
        { text: "Priority support", included: true },
        { text: "Advanced analytics", included: true },
        { text: "Custom AI voices", included: true },
      ],
    },
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to initialize.");

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billingPlan, billingInterval }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout failed");

      await stripe.redirectToCheckout({ sessionId: data.sessionId });
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(error.message || "Failed to initiate subscription");
    } finally {
      setIsLoading(false);
    }
  };

  const plansToShow =
    billingInterval === "monthly"
      ? ["FREE", "BASIC_MONTHLY", "PREMIUM_MONTHLY"]
      : ["FREE", "BASIC_ANNUALLY", "PREMIUM_ANNUALLY"];

  return (
    <main className="max-w-4xl">
      <h1 className="mb-4 text-2xl font-semibold">Billing Information</h1>
      <form onSubmit={handleSubscribe} className="space-y-6">
        <div className="space-y-2">
          <Label>Billing Interval</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={billingInterval === "monthly" ? "default" : "outline"}
              onClick={() => setBillingInterval("monthly")}
            >
              Monthly
            </Button>
            <Button
              type="button"
              variant={billingInterval === "annually" ? "default" : "outline"}
              onClick={() => setBillingInterval("annually")}
            >
              Annually
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {plansToShow.map((plan) => (
            <Card
              key={plan}
              className={`cursor-pointer p-6 transition-all ${
                billingPlan === plan
                  ? "border-2 border-primary shadow-lg"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setBillingPlan(plan)}
            >
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  {planDetails[plan].name}
                </h2>
                <p className="text-2xl font-bold">
                  ${planDetails[plan].price}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{billingInterval === "monthly" ? "month" : "year"}
                  </span>
                </p>
                {planDetails[plan].savings > 0 && (
                  <p className="text-sm text-green-600">
                    Save ${planDetails[plan].savings}
                  </p>
                )}
                <ul className="space-y-2">
                  {planDetails[plan].features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      {feature.included ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>

        <Button type="submit" disabled={isLoading} className="">
          {isLoading ? "Processing..." : "Continue to Checkout"}
        </Button>
      </form>
    </main>
  );
}
