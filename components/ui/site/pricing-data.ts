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
    "Lock in founder pricing while we're in beta, or talk to us about rolling Spoon out to your whole organization.",
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
        "Unlimited conversational AI practice",
        "Lessons, quizzes, and games built around your goals",
        "Achievements and verified certificates",
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
        "Everything in Beta Founder",
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