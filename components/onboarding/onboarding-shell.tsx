"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe2,
  Languages,
  Sparkles,
  UserRound,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

const languages = [
  { name: "English", flag: "🇬🇧" },
  { name: "French", flag: "🇫🇷" },
  { name: "Spanish", flag: "🇪🇸" },
  // { name: "German", flag: "🇩🇪" },
  // { name: "Italian", flag: "🇮🇹" },
  // { name: "Portuguese", flag: "🇵🇹" },
  // { name: "Japanese", flag: "🇯🇵" },
  // { name: "Korean", flag: "🇰🇷" },
];

const levels = [
  { name: "Beginner", description: "I'm just getting started" },
  { name: "Elementary", description: "I know some basics" },
  { name: "Intermediate", description: "I can hold simple conversations" },
  { name: "Advanced", description: "I want to become highly fluent" },
];

const goals = ["Speaking", "Listening", "Reading", "Writing", "Everything"];

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,30}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function OnboardingShell({
  sessionId,
  email,
}: {
  sessionId?: string;
  /** Email Stripe collected at checkout. Locks the email field when set. */
  email?: string;
}) {
  const { data: session, isPending } = authClient.useSession();
  const hasAccount = !!session?.user;

  const [step, setStep] = useState(1);

  // Account
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [emailValue, setEmailValue] = useState(email ?? "");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Learning preferences
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [level, setLevel] = useState("");
  const [goal, setGoal] = useState("");

  const totalSteps = 5;

  // Prefill from Google (or an existing session).
  useEffect(() => {
    if (!session?.user) return;
    const [first, ...rest] = (session.user.name ?? "").split(" ");
    setFirstName((prev) => prev || first || "");
    setLastName((prev) => prev || rest.join(" "));
    setEmailValue(session.user.email);
  }, [session]);

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

  const signInWithGoogle = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: `/onboarding${sessionId ? `?session_id=${sessionId}` : ""}`,
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
          // Google user: account exists, just save the profile details.
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
            "Something went wrong. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (step < totalSteps) {
      setStep((current) => current + 1);
    } else {
      // TODO: POST this + sessionId to your server to save the answers
      // and attach the Stripe customer to this user.
      console.log({
        sessionId,
        nativeLanguage,
        targetLanguage,
        level,
        goal,
      });
    }
  };

  const previousStep = () => {
    // Account is created at step 1, so don't go back into it.
    if (step > 2) {
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
            <span className="text-xl font-extrabold tracking-tight text-gray-900">
              SPOON ACADEMY
            </span>
          </div>

          <span className="text-sm font-bold text-gray-400">
            {step} / {totalSteps}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-12 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500"
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Content */}
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
                  <div className="mx-auto max-w-md">
                    {!hasAccount && !isPending && (
                      <>
                        <button
                          type="button"
                          onClick={signInWithGoogle}
                          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 font-bold text-gray-900 shadow-xs transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
                        >
                          <GoogleIcon />
                          Continue with Google
                        </button>

                        <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                          <span className="h-px flex-1 bg-gray-200" />
                          or
                          <span className="h-px flex-1 bg-gray-200" />
                        </div>
                      </>
                    )}

                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          label="First name"
                          autoComplete="given-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                        <Field
                          label="Last name"
                          autoComplete="family-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>

                      <Field
                        label="Username"
                        autoComplete="username"
                        placeholder="e.g. spoon_learner"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />

                      <Field
                        label="Email"
                        type="email"
                        autoComplete="email"
                        value={emailValue}
                        readOnly={hasAccount || !!email}
                        onChange={(e) => setEmailValue(e.target.value)}
                      />

                      {!hasAccount && (
                        <Field
                          label="Password"
                          type="password"
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      )}
                    </div>

                    {error && (
                      <p
                        role="alert"
                        className="mt-4 text-center text-sm font-medium text-red-600"
                      >
                        {error}
                      </p>
                    )}
                  </div>
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
                  <LanguageGrid
                    value={nativeLanguage}
                    onChange={setNativeLanguage}
                  />
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
                  <LanguageGrid
                    value={targetLanguage}
                    onChange={setTargetLanguage}
                    exclude={nativeLanguage}
                  />
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
                    {levels.map((item) => (
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
                    {goals.map((item) => (
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

        {/* Footer */}
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
   Field
------------------------------------------------- */

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-gray-700">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 font-medium text-gray-900 shadow-xs outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 read-only:bg-gray-50 read-only:text-gray-500"
      />
    </label>
  );
}

/* -------------------------------------------------
   Google icon
------------------------------------------------- */

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
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
        .map((language) => (
          <SelectionCard
            key={language.name}
            selected={value === language.name}
            onClick={() => onChange(language.name)}
          >
            <span className="text-2xl">{language.flag}</span>
            <span className="flex-1 font-bold text-gray-900">
              {language.name}
            </span>
          </SelectionCard>
        ))}
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
          : "border-gray-100 bg-white shadow-xs hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
      }`}
    >
      {children}

      <div
        className={`ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition ${
          selected ? "bg-violet-600 text-white" : "border-2 border-gray-200"
        }`}
      >
        {selected && <Check className="h-4 w-4 stroke-3" />}
      </div>
    </button>
  );
}