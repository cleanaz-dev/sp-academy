"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner"; // Assuming you're using sonner for toasts
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export function BillingForm({ currentBillingPlan }) {
  const [billingPlan, setBillingPlan] = useState(currentBillingPlan || "FREE");
  const [billingInterval, setBillingInterval] = useState("monthly");
  const [isLoading, setIsLoading] = useState(false);

  const planDetails = {
    FREE: { name: "Free Plan", price: 0 },
    BASIC_MONTHLY: { name: "Basic Monthly", price: 9.99, savings: 0 },
    BASIC_ANNUALLY: { name: "Basic Annually", price: 99.99, savings: 19.89 },
    PREMIUM_MONTHLY: { name: "Premium Monthly", price: 19.99, savings: 0 },
    PREMIUM_ANNUALLY: { name: "Premium Annually", price: 199.99, savings: 39.89 },
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

  return (
    <main className="max-w-4xl">
      <h1 className="font-semibold text-2xl mb-4">Billing Information</h1>
      <form onSubmit={handleSubscribe} className="space-y-4">
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

        <div className="space-y-2">
          <Label htmlFor="billingPlan">Subscription Plan</Label>
          <Select value={billingPlan} onValueChange={(value) => setBillingPlan(value)}>
            <SelectTrigger id="billingPlan">
              <SelectValue placeholder="Select a subscription plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">Free Plan (No Credit Card Required)</SelectItem>
              {billingInterval === "monthly" ? (
                <>
                  <SelectItem value="BASIC_MONTHLY">
                    Basic Monthly - ${planDetails.BASIC_MONTHLY.price}/mo
                  </SelectItem>
                  <SelectItem value="PREMIUM_MONTHLY">
                    Premium Monthly - ${planDetails.PREMIUM_MONTHLY.price}/mo
                  </SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="BASIC_ANNUALLY">
                    Basic Annually - ${planDetails.BASIC_ANNUALLY.price}/yr (Save ${planDetails.BASIC_ANNUALLY.savings})
                  </SelectItem>
                  <SelectItem value="PREMIUM_ANNUALLY">
                    Premium Annually - ${planDetails.PREMIUM_ANNUALLY.price}/yr (Save ${planDetails.PREMIUM_ANNUALLY.savings})
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-muted p-3 rounded-md">
          <p className="font-semibold">Selected Plan: {planDetails[billingPlan]?.name || "No Plan Selected"}</p>
          <p>Price: ${planDetails[billingPlan]?.price || 0}{billingInterval === "monthly" ? "/month" : "/year"}</p>
          {planDetails[billingPlan]?.savings > 0 && (
            <p className="text-green-600">You save ${planDetails[billingPlan].savings}</p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Processing..." : "Continue to Checkout"}
        </Button>
      </form>
    </main>
  );
}