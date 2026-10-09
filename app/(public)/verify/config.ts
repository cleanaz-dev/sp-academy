

export const verificationConfig = {
  "sign-in": {
    title: "Authentication Required",
    description: "You must be signed in to access the dashboard.",
    buttonText: "Go to Sign in",
    redirectUrl: "/sign-in",
  },
  "subscription-required": {
    title: "Active Subscription Required",
    description: "You need an active billing plan to view this page.",
    buttonText: "View Plans",
    redirectUrl: "/pricing", // or /checkout, wherever your pricing page is
  },
  // You can easily add more later: "email-unverified", "banned", etc.
} as const;

export type VerificationType = keyof typeof verificationConfig;