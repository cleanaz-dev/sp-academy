"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Globe2,
  Languages,
  Sparkles,
  UserRound,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { LANGUAGES, LEVELS, GOALS, USERNAME_RE, EMAIL_RE } from "./constants";
import { Question } from "./question";
import { SelectionCard } from "./selection-card";
import { AccountStep } from "./steps/account-step";
import { invokeEduBuilder } from "@/app/actions/invoke-edu-builder";

export default function OnboardingShell({
  sessionId,
  email,
}: {
  sessionId?: string;
  email?: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const hasAccount = !!session?.user;

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Account State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [emailValue, setEmailValue] = useState(email ?? "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preference State
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [goal, setGoal] = useState("");

  // Prefill Google details when session loads
  useEffect(() => {
    if (!session?.user) return;
    
    const [first, ...rest] = (session.user.name ?? "").split(" ");
    
    // Use functional updates so we only overwrite if the fields are currently empty
    setFirstName((prev) => prev || first || "");
    setLastName((prev) => prev || rest.join(" "));
    setEmailValue((prev) => prev || session.user.email || "");
  }, [session?.user]); // Track the specific user object, not the wrapper

  const accountValid =
    !isPending &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    USERNAME_RE.test(username.trim()) &&
    (hasAccount || (EMAIL_RE.test(emailValue.trim()) && password.length >= 8));

  const canContinue =
    step === 1
      ? accountValid
      : step === 2
        ? !!nativeLanguage
        : step === 3
          ? !!targetLanguage && targetLanguage !== nativeLanguage
          : step === 4
            ? !!level
            : !!goal;

  // Added async, preventDefault, and error handling
  const signInWithGoogle = async (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevent accidental form submissions from reloading the page
    setError(null);
    
    try {
      const { error: signInError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `/onboarding${sessionId ? `?session_id=${sessionId}` : ""}`,
      });
      
      if (signInError) {
        setError(signInError.message || "Failed to connect to Google.");
      }
    } catch (err) {
      console.error("Google OAuth error:", err);
      setError("An unexpected error occurred connecting to Google.");
    }
  };

  const handleCompleteOnboarding = async () => {
    const userId = session?.user?.id;

    if (!userId) {
      console.error("No user ID found");
      return;
    }

    await invokeEduBuilder({
      userId,
      firstName,
      gender: "unspecified",
      spoon: 1,
      nativeLanguage,
      targetLanguage,
      levelBand: level,
      goal,
      scriptComfort: "unspecified",
      type: "lang",
      isOnboarding: true,
      sessionId,
    });
  };

  const nextStep = async () => {
    if (!canContinue || submitting) return;

    if (step === 1) {
      setSubmitting(true);
      setError(null);

      try {
        const first = firstName.trim();
        const last = lastName.trim();
        const name = `${first} ${last}`;

        if (hasAccount) {
          const { error } = await authClient.updateUser({
            name,
            firstName: first,
            lastName: last,
            username: username.trim(),
          });
          if (error) throw error;
        } else {
          const { error } = await authClient.signUp.email({
            email: emailValue.trim(),
            password,
            name,
            firstName: first,
            lastName: last,
            username: username.trim(),
          });
          if (error) throw error;
        }
        setStep(2);
      } catch (err) {
        setError(
          (err as { message?: string })?.message ??
            "Something went wrong. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (step < totalSteps) {
      setStep((current) => current + 1);
    } else {
      await handleCompleteOnboarding();
    }
  };

  const previousStep = () => {
    if (step > 2) setStep((current) => current - 1);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8F9FC] font-sans selection:bg-violet-200">
      {/* Background Blurs */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-violet-400/20 blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 top-40 -z-10 h-[400px] w-[400px] rounded-full bg-teal-400/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-40 top-80 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-[100px]" />

      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-10">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight text-gray-900">
            SPOON ACADEMY
          </span>
          <span className="text-sm font-bold text-gray-400">
            {step} / {totalSteps}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500"
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Dynamic Step Content */}
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <Question
                  key="account"
                  icon={<UserRound className="h-5 w-5" />}
                  eyebrow="Welcome to Spoon"
                  title={
                    hasAccount ? "Finish your profile" : "Create your account"
                  }
                  description={
                    hasAccount
                      ? "Just a couple of details and you're in."
                      : "Sign up to save your progress and pick up where you left off."
                  }
                >
                  <AccountStep
                    hasAccount={hasAccount}
                    isPending={isPending}
                    lockedEmail={email}
                    firstName={firstName}
                    setFirstName={setFirstName}
                    lastName={lastName}
                    setLastName={setLastName}
                    username={username}
                    setUsername={setUsername}
                    email={emailValue}
                    setEmail={setEmailValue}
                    password={password}
                    setPassword={setPassword}
                    error={error}
                    onGoogleSignIn={signInWithGoogle}
                  />
                </Question>
              )}

              {step === 2 && (
                <Question
                  key="native"
                  icon={<Globe2 className="h-5 w-5" />}
                  eyebrow="First things first"
                  title="What's your native language?"
                  description="We'll use this to personalize translations and explanations."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {LANGUAGES.map((item) => (
                      <SelectionCard
                        key={item.name}
                        selected={nativeLanguage === item.name}
                        onClick={() => setNativeLanguage(item.name)}
                      >
                        <span className="text-2xl">{item.flag}</span>
                        <span className="flex-1 font-bold text-gray-900">
                          {item.name}
                        </span>
                      </SelectionCard>
                    ))}
                  </div>
                </Question>
              )}

              {step === 3 && (
                <Question
                  key="target"
                  icon={<Sparkles className="h-5 w-5" />}
                  eyebrow="Your learning journey"
                  title="What language do you want to learn?"
                  description="Choose the language you want to start mastering."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {LANGUAGES.filter(
                      (item) => item.name !== nativeLanguage,
                    ).map((item) => (
                      <SelectionCard
                        key={item.name}
                        selected={targetLanguage === item.name}
                        onClick={() => setTargetLanguage(item.name)}
                      >
                        <span className="text-2xl">{item.flag}</span>
                        <span className="flex-1 font-bold text-gray-900">
                          {item.name}
                        </span>
                      </SelectionCard>
                    ))}
                  </div>
                </Question>
              )}

              {step === 4 && (
                <Question
                  key="level"
                  icon={<Languages className="h-5 w-5" />}
                  eyebrow="Know yourself"
                  title="What's your current level?"
                  description="Don't worry about getting this perfect. You can change it later."
                >
                  <div className="grid gap-3">
                    {LEVELS.map((item) => (
                      <SelectionCard
                        key={item.name}
                        selected={level === item.name}
                        onClick={() => setLevel(item.name)}
                      >
                        <div>
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="mt-1 text-sm font-medium text-gray-500">
                            {item.description}
                          </p>
                        </div>
                      </SelectionCard>
                    ))}
                  </div>
                </Question>
              )}

              {step === 5 && (
                <Question
                  key="goal"
                  icon={<Sparkles className="h-5 w-5" />}
                  eyebrow="Make it yours"
                  title="What do you want to focus on?"
                  description="We'll tailor your experience around what matters most to you."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {GOALS.map((item) => (
                      <SelectionCard
                        key={item}
                        selected={goal === item}
                        onClick={() => setGoal(item)}
                      >
                        <span className="font-bold text-gray-900">{item}</span>
                      </SelectionCard>
                    ))}
                  </div>
                </Question>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 flex items-center justify-between">
          <button
            type="button"
            onClick={previousStep}
            disabled={step <= 2}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-gray-500 transition hover:bg-white hover:text-gray-900 disabled:pointer-events-none disabled:opacity-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={!canContinue || submitting}
            className="group flex items-center gap-2 rounded-2xl bg-gray-900 px-7 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-gray-900"
          >
            {submitting
              ? "Saving…"
              : step === 1 && !hasAccount
                ? "Create account"
                : step === totalSteps
                  ? "Let's get started"
                  : "Continue"}

            {!submitting && (
              <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}