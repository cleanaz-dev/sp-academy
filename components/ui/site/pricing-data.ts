export type PlanAccent = "primary" | "secondary" | "tertiary";
export type BillingIntervalOption = "monthly" | "annual";

export type Plan = {
  id: string;
  name: string;
  label: string;
  accent: PlanAccent;
  featured: boolean;
  price: string;
  originalPrice: string;
  period: string;
  annualPrice?: string;         // Equivalent monthly price when billed yearly (e.g. "$29")
  annualTotal?: string;         // Total billed once per year (e.g. "$348 CAD billed annually")
  annualSavingsLabel?: string;  // Badge (e.g. "Save $72/yr")
  description: string;
  features: string[];
  cta: { label: string; href: string };
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
  headingAccent: "Real fluency.",
  intro:
    "Lock in Beta Founder pricing for full access to personalized Spoons, video Vocab Bridges, Boss Stages, and daily AI speaking practice—plus our private learner community.",
  footnote:
    "Prices in CAD. Beta founders keep their rate locked in for as long as their subscription stays active.",
  plans: [
    {
      id: "founder",
      name: "Spoon Core • Founder",
      label: "Beta Founder Offer",
      accent: "primary",
      featured: true,
      price: "$35",
      originalPrice: "$49",
      period: "CAD /month",
      annualPrice: "$29",
      annualTotal: "$348 CAD billed annually",
      annualSavingsLabel: "2 months free (Save $72)",
      description:
        "15 full custom-baked learning cycles every month, personal Sprite coaching, and daily AI conversation practice.",
      features: [
        "15 full learning cycles per month (45 Spoons + 45 Video Vocab Bridges)",
        "15 interactive Boss Stage assessments with live speech grading",
        "5 AI Conversation sessions per day (5-min sprints, 5-min cooldown)",
        "Personal AI Sprite Coach (Vox or Vivi) + Word Matrix tracking",
        "Private Founder Community access & weekly speaking challenges",
        "Founder rate locked in for life",
      ],
      cta: {
        label: "Become a founder",
        href: "/signup",
      },
    },
    {
      id: "unlimited",
      name: "Spoon Unlimited+",
      label: "For Intensive Learners",
      accent: "secondary",
      featured: false,
      price: "$125",
      originalPrice: "$159",
      period: "CAD /month",
      annualPrice: "$99",
      annualTotal: "$1,188 CAD billed annually",
      annualSavingsLabel: "Save $312/year",
      description:
        "Built for rapid immersion—4x the monthly learning cycles, cinematic Boss Stages, and expanded AI speaking time.",
      features: [
        "60 full learning cycles per month (180 Spoons + 180 Video Vocab Bridges)",
        "60 cinematic, video-enhanced Boss Stage assessments",
        "15 AI Conversation sessions per day with zero cooldown friction",
        "Priority background lesson & audio baking",
        "VIP Founder Community access + verified fluency milestones",
        "Early access to new Sprite Exercises & languages",
      ],
      cta: {
        label: "Go Unlimited+",
        href: "/signup",
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
        "Custom spoken-language training for schools, government teams, and organizations.",
      features: [
        "Everything in Spoon Unlimited+",
        "Team dashboards, Word Matrix analytics, and progress reporting",
        "Custom industry scenarios and Boss Stage roleplays",
        "Single sign-on (SSO) and admin seat management",
        "Dedicated onboarding and priority support",
      ],
      cta: {
        label: "Contact sales",
        href: "/contact",
      },
    },
  ],
};