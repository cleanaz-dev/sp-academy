// app/(public)/onboarding/page.tsx

import OnboardingShell from "@/components/onboarding/onboarding-shell";

type OnboardingPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const { session_id } = await searchParams;

  return <OnboardingShell sessionId={session_id} />;
}