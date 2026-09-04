"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe2,
  Languages,
  Sparkles,
} from "lucide-react";

const languages = [
  { name: "English", flag: "🇬🇧" },
  { name: "French", flag: "🇫🇷" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "German", flag: "🇩🇪" },
  { name: "Italian", flag: "🇮🇹" },
  { name: "Portuguese", flag: "🇵🇹" },
  { name: "Japanese", flag: "🇯🇵" },
  { name: "Korean", flag: "🇰🇷" },
];

const levels = [
  {
    name: "Beginner",
    description: "I'm just getting started",
  },
  {
    name: "Elementary",
    description: "I know some basics",
  },
  {
    name: "Intermediate",
    description: "I can hold simple conversations",
  },
  {
    name: "Advanced",
    description: "I want to become highly fluent",
  },
];

const goals = [
  "Speaking",
  "Listening",
  "Reading",
  "Writing",
  "Everything",
];

export default function OnboardingShell({
  sessionId,
}: {
  sessionId?: string;
}) {
  const [step, setStep] = useState(1);

  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [goal, setGoal] = useState("");

  const totalSteps = 4;

  const canContinue =
    step === 1
      ? !!nativeLanguage
      : step === 2
        ? !!targetLanguage && targetLanguage !== nativeLanguage
        : step === 3
          ? !!level
          : !!goal;

  const nextStep = () => {
    if (!canContinue) return;

    if (step < totalSteps) {
      setStep((current) => current + 1);
    } else {
      // We'll save onboarding data here later.
      console.log({
        nativeLanguage,
        targetLanguage,
        level,
        goal,
      });
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep((current) => current - 1);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8F9FC] font-sans selection:bg-violet-200">
      {/* Background */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-400/20 blur-[120px]" />

      <div className="pointer-events-none absolute -left-40 top-40 -z-10 h-[400px] w-[400px] rounded-full bg-teal-400/10 blur-[100px]" />

      <div className="pointer-events-none absolute -right-40 top-80 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-[100px]" />

      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100">
              <Languages className="h-5 w-5 text-violet-600" />
            </div>

            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              LOUD
            </span>
          </div>

          <span className="text-sm font-bold text-gray-400">
            {step} / {totalSteps}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-12 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            animate={{
              width: `${(step / totalSteps) * 100}%`,
            }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Content */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <Question
                  key="native"
                  icon={<Globe2 className="h-5 w-5" />}
                  eyebrow="First things first"
                  title="What's your native language?"
                  description="We'll use this to personalize translations and explanations."
                >
                  <LanguageGrid
                    value={nativeLanguage}
                    onChange={setNativeLanguage}
                  />
                </Question>
              )}

              {step === 2 && (
                <Question
                  key="target"
                  icon={<Sparkles className="h-5 w-5" />}
                  eyebrow="Your learning journey"
                  title="What language do you want to learn?"
                  description="Choose the language you want to start mastering."
                >
                  <LanguageGrid
                    value={targetLanguage}
                    onChange={setTargetLanguage}
                    exclude={nativeLanguage}
                  />
                </Question>
              )}

              {step === 3 && (
                <Question
                  key="level"
                  icon={<Languages className="h-5 w-5" />}
                  eyebrow="Know yourself"
                  title="What's your current level?"
                  description="Don't worry about getting this perfect. You can change it later."
                >
                  <div className="grid gap-3">
                    {levels.map((item) => {
                      const selected = level === item.name;

                      return (
                        <SelectionCard
                          key={item.name}
                          selected={selected}
                          onClick={() => setLevel(item.name)}
                        >
                          <div>
                            <p className="font-bold text-gray-900">
                              {item.name}
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-500">
                              {item.description}
                            </p>
                          </div>
                        </SelectionCard>
                      );
                    })}
                  </div>
                </Question>
              )}

              {step === 4 && (
                <Question
                  key="goal"
                  icon={<Sparkles className="h-5 w-5" />}
                  eyebrow="Make it yours"
                  title="What do you want to focus on?"
                  description="We'll tailor your experience around what matters most to you."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {goals.map((item) => {
                      const selected = goal === item;

                      return (
                        <SelectionCard
                          key={item}
                          selected={selected}
                          onClick={() => setGoal(item)}
                        >
                          <span className="font-bold text-gray-900">
                            {item}
                          </span>
                        </SelectionCard>
                      );
                    })}
                  </div>
                </Question>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 flex items-center justify-between">
          <button
            type="button"
            onClick={previousStep}
            disabled={step === 1}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 transition hover:bg-white hover:text-gray-900 disabled:pointer-events-none disabled:opacity-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={!canContinue}
            className="group flex items-center gap-2 rounded-2xl bg-gray-900 px-7 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-900"
          >
            {step === totalSteps ? "Let's get started" : "Continue"}

            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   Question
------------------------------------------------- */

function Question({
  icon,
  eyebrow,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl"
    >
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600">
          {icon}
        </div>

        <p className="mb-3 text-sm font-bold uppercase tracking-wider text-violet-600">
          {eyebrow}
        </p>

        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-lg text-base font-medium leading-relaxed text-gray-500">
          {description}
        </p>
      </div>

      <div className="mt-10">{children}</div>
    </motion.div>
  );
}

/* -------------------------------------------------
   Language Grid
------------------------------------------------- */

function LanguageGrid({
  value,
  onChange,
  exclude,
}: {
  value: string;
  onChange: (value: string) => void;
  exclude?: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {languages
        .filter((language) => language.name !== exclude)
        .map((language) => {
          const selected = value === language.name;

          return (
            <SelectionCard
              key={language.name}
              selected={selected}
              onClick={() => onChange(language.name)}
            >
              <span className="text-2xl">{language.flag}</span>

              <span className="flex-1 font-bold text-gray-900">
                {language.name}
              </span>
            </SelectionCard>
          );
        })}
    </div>
  );
}

/* -------------------------------------------------
   Selection Card
------------------------------------------------- */

function SelectionCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
        selected
          ? "border-violet-400 bg-violet-50 shadow-md shadow-violet-500/10"
          : "border-gray-100 bg-white shadow-sm hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
      }`}
    >
      {children}

      <div
        className={`ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
          selected
            ? "bg-violet-600 text-white"
            : "border-2 border-gray-200"
        }`}
      >
        {selected && <Check className="h-4 w-4 stroke-[3]" />}
      </div>
    </button>
  );
}