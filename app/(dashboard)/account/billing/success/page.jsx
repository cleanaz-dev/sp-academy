"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BillingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Optional: Verify subscription status
    async function verifySubscription() {
      try {
        const response = await fetch("/api/verify-subscription");
        const data = await response.json();

        if (data.subscriptionActive) {
          // Show success message or redirect
          toast.success("Subscription activated successfully!");
        }
      } catch (error) {
        console.error("Subscription verification error:", error);
      }
    }

    verifySubscription();
  }, []);

  return (
    <div className="container mx-auto py-10 text-center">
      <h1 className="mb-4 text-3xl font-bold">Subscription Successful!</h1>
      <p className="text-lg">Thank you for subscribing. Redirecting...</p>
    </div>
  );
}
