"use client";

interface AccountStepProps {
  hasAccount: boolean;
  isPending: boolean;
  sessionId?: string;
  lockedEmail?: string;
  firstName: string;
  setFirstName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  username: string;
  setUsername: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  error: string | null;
  onGoogleSignIn: () => void;
}

export function AccountStep({
  hasAccount,
  isPending,
  lockedEmail,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  username,
  setUsername,
  email,
  setEmail,
  password,
  setPassword,
  error,
  onGoogleSignIn,
}: AccountStepProps) {
  return (
    <div className="mx-auto max-w-md">
      {!hasAccount && !isPending && (
        <>
          <button
            type="button"
            onClick={onGoogleSignIn}
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
          value={email}
          readOnly={hasAccount || !!lockedEmail}
          onChange={(e) => setEmail(e.target.value)}
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
        <p role="alert" className="mt-4 text-center text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-gray-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3.5 font-medium text-gray-900 shadow-xs outline-none transition placeholder:text-gray-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 read-only:bg-gray-50 read-only:text-gray-500"
      />
    </label>
  );
}

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