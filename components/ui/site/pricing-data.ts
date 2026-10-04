export type PlanAccent = "primary" | "secondary" | "tertiary";

export type Plan = {
  id: string;
  name: string;
  label: string;
  accent: PlanAccent;
  featured: boolean;
  price: string;
  originalPrice: string;
  period: string;
  description: string;
  features: string[];
  cta: { label: string; href: string };
  stripe: { productId: string; priceId: string };
};

export type PricingData = {
  eyebrow: string;
  heading: string;
  headingAccent: string;
  intro: string;
  footnote: string;
  plans: Plan[];
};

export const PRICING_DATA: PricingData = {
  eyebrow: "Pricing",
  heading: "Simple pricing.",
  headingAccent: "Real progress.",
  intro:
    "Lock in founder pricing while we're in beta, go unlimited, or talk to us about rolling Spoon out to your whole organization.",
  footnote:
    "Prices in USD. Beta founders keep their rate for as long as their subscription stays active.",
  plans: [
    {
      id: "founder",
      name: "Beta Founder",
      label: "Limited beta offer",
      accent: "primary",
      featured: true,
      price: "$20",
      originalPrice: "$34",
      period: "/month",
      description: "Full access to Spoon at a founder rate that never goes up.",
      features: [
        "3 Spoon lessons per day",
        "Unlimited conversational AI practice",
        "Lessons, quizzes, and games built around your goals",
        "Achievements",
        "Founder rate locked in for life",
        "Early access to new features",
      ],
      cta: {
        label: "Become a founder",
        href: "/signup",
      },
      stripe: {
        productId: process.env.NEXT_PUBLIC_STRIPE_FOUNDER_PRODUCT_ID ?? "",
        priceId: process.env.NEXT_PUBLIC_STRIPE_FOUNDER_PRICE_ID ?? "",
      },
    },
    {
      id: "unlimited",
      name: "Unlimited Learner",
      label: "For serious learners",
      accent: "secondary",
      featured: false,
      price: "$39", // placeholder, set your real price
      originalPrice: "",
      period: "/month",
      description: "Everything in Spoon with no daily limits on lessons.",
      features: [
        "Unlimited Spoon lessons",
        "Unlimited conversational AI practice",
        "Lessons, quizzes, and games built around your goals",
        "Achievements and verified certificates",
        "Early access to new features",
      ],
      cta: {
        label: "Go unlimited",
        href: "/signup",
      },
      stripe: {
        productId: process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_PRODUCT_ID ?? "",
        priceId: process.env.NEXT_PUBLIC_STRIPE_UNLIMITED_PRICE_ID ?? "",
      },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      label: "For teams and organizations",
      accent: "tertiary",
      featured: false,
      price: "Custom",
      originalPrice: "",
      period: "",
      description:
        "Language learning for schools, companies, and training programs.",
      features: [
        "Everything in Unlimited Learner",
        "Team dashboards and progress reporting",
        "Custom learning paths and content",
        "Single sign-on and admin controls",
        "Dedicated onboarding and support",
      ],
      cta: {
        label: "Contact sales",
        href: "/contact",
      },
      stripe: {
        productId: "",
        priceId: "",
      },
    },
  ],
};