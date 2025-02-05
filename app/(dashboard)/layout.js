"use client";

import DashboardLayout from "../../components/dashboard-layout";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function Layout({ children }) {
  return (
    <div>
      <DashboardLayout>
        <Elements stripe={stripePromise}>{children}</Elements>
      </DashboardLayout>
    </div>
  );
}
