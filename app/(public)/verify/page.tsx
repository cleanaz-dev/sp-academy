// app/(public)/verify/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { verificationConfig, VerificationType } from "./config";

export default async function VerifyPage({
  searchParams,
}: {
  // In Next.js 15, searchParams is a Promise
  searchParams: Promise<{ type?: string }>; 
}) {
  const resolvedParams = await searchParams;
  const type = resolvedParams.type as VerificationType;

  // Fallback if there is no type provided or the type doesn't exist in config
  if (!type || !verificationConfig[type]) {
    redirect("/"); 
  }

  const config = verificationConfig[type];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md text-center space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {config.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            {config.description}
          </p>
        </div>

        <Link
          href={config.redirectUrl}
          className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {config.buttonText}
        </Link>
      </div>
    </div>
  );
}