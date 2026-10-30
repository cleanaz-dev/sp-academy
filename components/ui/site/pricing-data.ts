// components/pricing/pricing-data.ts

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
  annualPrice?: string;
  annualTotal?: string;
  annualSavingsLabel?: string;
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

// ---------------------------------------------------------------------------
// INDIVIDUAL PLANS
// ---------------------------------------------------------------------------

export const PLAN_FREE_MILESTONE: Plan = {
  id: "free",
  name: "Milestone 1 Pass",
  label: "Free Test Drive",
  accent: "secondary",
  featured: false,
  price: "$0",
  originalPrice: "",
  period: "Free test drive",
  description:
    "Test-drive the complete learning engine through Milestone 1 before committing.",
  features: [
    "Full access to Milestone 1 (Spoons 1–3 + Vocab Bridges 1–3)",
    "Boss Stage 1 Assessment with live Azure pronunciation analysis",
    "1-on-1 Interactive Chalkboard prep with your AI Sprite (Vox or Vivi)",
    "Personal Word Matrix & speech resonance tracking",
    "No credit card required to start",
  ],
  cta: {
    label: "Start Milestone 1 Free",
    href: "/signup",
  },
};

export const PLAN_CORE_FOUNDER: Plan = {
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
    "Daily structured fluency: 15 full learning cycles per month with personal Chalkboard tutoring and live AI speaking practice.",
  features: [
    "Up to 45 custom-baked Spoons + 45 Video Vocab Bridges monthly (15 complete cycles)",
    "15 interactive Boss Stage assessments with live pronunciation grading",
    "1-on-1 Step-by-Step Chalkboard Tutoring with 3D visuals, syntax tiles & accent assistance",
    "5 daily 5-minute AI Conversation sprints (spaced-repetition pacing)",
    "Targeted 3-Round Repair Arcades that diagnose and drill your exact mistakes",
    "Private Founder Community access & weekly speaking challenges",
    "Lifetime Founder rate lock (keeps $35 CAD/mo as new modules release)",
  ],
  cta: {
    label: "Become a founder",
    href: "/signup",
  },
};

export const PLAN_UNLIMITED_PLUS: Plan = {
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
    "Built for rapid immersion, exam prep (TEF/DELF), and relocation—unthrottled learning cycles and unlimited Sprite energy.",
  features: [
    "Up to 180 Spoons + 180 Video Vocab Bridges monthly (60 complete cycles)",
    "60 cinematic, video-enhanced Boss Stage assessments",
    "15 daily AI Conversation sessions with zero cooldown friction",
    "Unlimited Sprite Energy (⚡) — no nap cooldowns on bonus Chalkboard drills",
    "Priority background lesson pre-baking & high-speed audio generation",
    "Targeted professional & certification vocabulary focus",
    "VIP Founder Community access + early beta access to Read-Along Books",
  ],
  cta: {
    label: "Go Unlimited+",
    href: "/signup",
  },
};

export const PLAN_ENTERPRISE: Plan = {
  id: "enterprise",
  name: "Enterprise",
  label: "For teams and organizations",
  accent: "tertiary",
  featured: false,
  price: "Custom",
  originalPrice: "",
  period: "",
  description:
    "Custom spoken-language immersion for schools, government departments, and multinational teams.",
  features: [
    "Everything in Spoon Unlimited+ with custom seat allocations",
    "Team dashboards, Word Matrix cohort analytics, and progress reporting",
    "Custom workplace scenarios, terminology, and customized Boss Stages",
    "Single Sign-On (SSO) and centralized admin billing",
    "Dedicated onboarding specialist & SLA support",
  ],
  cta: {
    label: "Contact sales",
    href: "/contact",
  },
};

// ---------------------------------------------------------------------------
// ARRAY 1: PAID ONLY (Current 3 plans — matches your layout 1:1)
// ---------------------------------------------------------------------------
export const PRICING_PLANS_PAID_ONLY: Plan[] = [
  PLAN_CORE_FOUNDER,
  PLAN_UNLIMITED_PLUS,
  PLAN_ENTERPRISE,
];

// ---------------------------------------------------------------------------
// ARRAY 2: WITH FREE TIER (Includes Milestone 1 Pass)
// ---------------------------------------------------------------------------
export const PRICING_PLANS_WITH_FREE: Plan[] = [
  PLAN_FREE_MILESTONE,
  PLAN_CORE_FOUNDER,
  PLAN_UNLIMITED_PLUS,
  PLAN_ENTERPRISE,
];

// ---------------------------------------------------------------------------
// DEFAULT EXPORT (Uses the 3-plan paid array so nothing breaks)
// ---------------------------------------------------------------------------
export const PRICING_DATA: PricingData = {
  eyebrow: "Pricing",
  heading: "Simple pricing.",
  headingAccent: "Real fluency.",
  intro:
    "Lock in Beta Founder pricing for full access to personalized Spoons, video Vocab Bridges, 1-on-1 Chalkboard coaching, and daily AI conversation practice.",
  footnote:
    "Prices in CAD. Beta founders keep their discounted rate locked in for the entire life of their active subscription.",
  plans: PRICING_PLANS_PAID_ONLY,
};