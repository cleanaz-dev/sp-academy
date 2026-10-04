"use client";

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  Check,
  Infinity as InfinityIcon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/ui/misc/reveal";
import { Button } from "@/components/ui/button";

import {
  PRICING_DATA as pricingData,
  type Plan,
  type PlanAccent,
} from "./pricing-data";

const PLANS = pricingData.plans;

const PLAN_ICONS: Record<string, LucideIcon> = {
  founder: Sparkles,
  unlimited: InfinityIcon,
  enterprise: Building2,
};

// Full class strings so Tailwind can detect them (no dynamic string building).
const ACCENTS: Record<
  PlanAccent,
  { text: string; chip: string; featured: string; focus: string }
> = {
  primary: {
    text: "text-primary",
    chip: "bg-primary/15 text-primary",
    featured:
      "border-primary/40 shadow-[0_0_0_4px_hsl(var(--primary)/0.1),0_1px_2px_hsl(var(--foreground)/0.06),0_24px_60px_hsl(var(--foreground)/0.07)]",
    focus: "focus-visible:outline-primary",
  },
  secondary: {
    text: "text-secondary",
    chip: "bg-secondary/15 text-secondary",
    featured:
      "border-secondary/40 shadow-[0_0_0_4px_hsl(var(--secondary)/0.1),0_1px_2px_hsl(var(--foreground)/0.06),0_24px_60px_hsl(var(--foreground)/0.07)]",
    focus: "focus-visible:outline-secondary",
  },
  tertiary: {
    text: "text-tertiary",
    chip: "bg-tertiary/15 text-tertiary",
    featured:
      "border-tertiary/40 shadow-[0_0_0_4px_hsl(var(--tertiary)/0.1),0_1px_2px_hsl(var(--foreground)/0.06),0_24px_60px_hsl(var(--foreground)/0.07)]",
    focus: "focus-visible:outline-tertiary",
  },
};

const CARD_BASE =
  "relative isolate flex w-full overflow-hidden rounded-[1.25rem] border p-6 md:p-9";
const CARD_DEFAULT =
  "border-border/75 shadow-[0_1px_1px_hsl(var(--foreground)/0.03),0_18px_50px_hsl(var(--foreground)/0.04)]";

const CTA_BASE =
  "h-[2.85rem] w-fit gap-2 rounded-full border px-5 font-semibold shadow-none transition-all duration-200 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60 motion-reduce:transition-none";

export default function PricingSection() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

async function startCheckout(plan: Plan) {
  setError(null);
  setLoadingId(plan.id);

  try {
    const response = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.id }),
    });

    const data = await response.json();

    if (!response.ok || !data.url) {
      throw new Error("Checkout failed");
    }

    window.location.href = data.url;
  } catch {
    setError("We couldn't start checkout. Please try again.");
    setLoadingId(null);
  }
}

  return (
    <section
      aria-labelledby="pricing-heading"
      className="relative isolate overflow-clip bg-background py-[clamp(4rem,7vh,5.5rem)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_30%,hsl(var(--primary)/0.08),transparent_32rem),radial-gradient(circle_at_88%_30%,hsl(var(--tertiary)/0.08),transparent_30rem),linear-gradient(180deg,transparent,hsl(var(--muted)/0.22)_50%,transparent)]"
      />

      <div className="mx-auto w-full max-w-6xl px-4">
        <Reveal className="mx-auto max-w-[44rem] text-center" y={18}>
          <span className="inline-flex min-h-8 items-center rounded-full border border-border/80 bg-background/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-foreground/70 backdrop-blur-md">
            {pricingData.eyebrow}
          </span>

          <h2
            id="pricing-heading"
            className="mt-4 text-balance text-[clamp(2.15rem,4vw,3.65rem)] font-bold leading-[1.02] tracking-[-0.045em] text-foreground"
          >
            {pricingData.heading}{" "}
            <span className="text-foreground/55">
              {pricingData.headingAccent}
            </span>
          </h2>

          <p className="mx-auto mt-3.5 max-w-[37rem] text-balance text-[clamp(1rem,1.5vw,1.1rem)] leading-relaxed text-muted-foreground">
            {pricingData.intro}
          </p>
        </Reveal>

        <div className="mx-auto mt-[clamp(2rem,4vh,3rem)] grid max-w-6xl grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
          {PLANS.map((plan, index) => {
            const Icon = PLAN_ICONS[plan.id] ?? Sparkles;
            const accent = ACCENTS[plan.accent];
            const isLoading = loadingId === plan.id;
            const isFounder = plan.id === "founder";
            const usesCheckout = plan.id !== "enterprise";

            return (
              <Reveal
                key={plan.id}
                className="flex"
                delay={0.08 + index * 0.08}
                y={16}
              >
                <article
                  aria-labelledby={`plan-${plan.id}-name`}
                  className={`${CARD_BASE} ${
                    isFounder
                      ? "bg-primary border-primary shadow-2xl"
                      : `bg-card/90 backdrop-blur-xl ${
                          plan.featured ? accent.featured : CARD_DEFAULT
                        }`
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    strokeWidth={1.15}
                    className={`pointer-events-none absolute -right-12 top-6 -z-10 size-44 -rotate-[7deg] md:-right-8 md:size-52 ${
                      isFounder
                        ? "text-primary-foreground opacity-[0.15]"
                        : `${accent.text} opacity-[0.055]`
                    }`}
                  />

                  <div className="relative z-10 flex w-full flex-col">
                    <span
                      className={`inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest before:h-px before:w-7 before:bg-current before:content-[''] ${
                        isFounder ? "text-primary-foreground" : accent.text
                      }`}
                    >
                      {plan.label}
                    </span>

                    <h3
                      id={`plan-${plan.id}-name`}
                      className={`mt-3.5 text-balance text-[clamp(1.75rem,2.6vw,2.25rem)] font-bold leading-[1.03] tracking-[-0.04em] ${
                        isFounder
                          ? "text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {plan.name}
                    </h3>

                    <div className="mt-5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                      <span
                        className={`text-[clamp(2.5rem,4.5vw,3.5rem)] font-bold leading-none tracking-[-0.05em] ${
                          isFounder
                            ? "text-primary-foreground"
                            : "text-foreground"
                        }`}
                      >
                        {plan.price}
                      </span>

                      {plan.period && (
                        <span
                          className={`text-base font-medium ${
                            isFounder
                              ? "text-primary-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {plan.period}
                        </span>
                      )}

                      {plan.originalPrice && (
                        <span
                          className={`text-base font-medium line-through ${
                            isFounder
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground/80"
                          }`}
                        >
                          <span className="sr-only">Regular price </span>
                          {plan.originalPrice}
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-4 text-[clamp(1rem,1.35vw,1.05rem)] leading-[1.7] ${
                        isFounder
                          ? "text-primary-foreground/90"
                          : "text-muted-foreground"
                      }`}
                    >
                      {plan.description}
                    </p>

                    <ul
                      className={`mt-6 grid gap-3 border-t pt-6 ${
                        isFounder
                          ? "border-primary-foreground/20"
                          : "border-border/80"
                      }`}
                    >
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className={`flex items-start gap-3 text-[0.95rem] font-medium leading-snug ${
                            isFounder
                              ? "text-primary-foreground/90"
                              : "text-foreground/85"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 inline-grid size-5 flex-none place-items-center rounded-full ${
                              isFounder
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : accent.chip
                            }`}
                          >
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-8">
                      {usesCheckout ? (
                        <Button
                          type="button"
                          disabled={isLoading}
                          onClick={() => startCheckout(plan)}
                          className={
                            isFounder
                              ? `${CTA_BASE} border-white bg-white text-primary hover:bg-white/90 focus-visible:outline-white`
                              : `${CTA_BASE} border-purple-600 bg-purple-600 text-white hover:bg-purple-700 ${accent.focus}`
                          }
                        >
                          {isLoading ? "Redirecting…" : plan.cta.label}
                          {!isLoading && (
                            <ArrowRight className="size-4" aria-hidden="true" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          nativeButton={false}
                          render={<Link href={plan.cta.href} />}
                          className={`${CTA_BASE} border-purple-600 bg-purple-600 text-white hover:bg-purple-700 ${accent.focus}`}
                        >
                          {plan.cta.label}
                          <ArrowRight className="size-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {error && (
          <p role="alert" className="mt-5 text-center text-sm text-destructive">
            {error}
          </p>
        )}

        <p className="mx-auto mt-7 max-w-[37rem] text-balance text-center text-sm leading-relaxed text-muted-foreground">
          {pricingData.footnote}
        </p>
      </div>
    </section>
  );
}