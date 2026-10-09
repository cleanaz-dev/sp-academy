import { SignInForm } from "./sign-in-form";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  // Only allow internal paths to prevent open redirects
  const callbackURL =
    redirect && redirect.startsWith("/") && !redirect.startsWith("//")
      ? redirect
      : "/dashboard";

  return (
    <div className="mx-auto flex h-screen items-center justify-center">
      <SignInForm callbackURL={callbackURL} />
    </div>
  );
}