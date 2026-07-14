"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// useSearchParams needs a Suspense boundary around it in the App
// Router — without one, Next.js can't statically render anything
// above it and throws a build warning. This wrapper pattern is the
// standard fix: a plain outer component that renders the real
// logic inside <Suspense>.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Something went wrong.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 text-center">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-neutral-900">
          Invalid link
        </h1>
        <p className="text-sm text-neutral-500">
          This reset link is missing its token. Request a new one from{" "}
          <Link href="/forgot-password" className="underline">
            the forgot password page
          </Link>
          .
        </p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 text-center">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-neutral-900">
          Password updated
        </h1>
        <p className="text-sm text-neutral-500">Taking you to log in…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-neutral-900">
        Set a new password
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-neutral-700">
            New password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          />
          <span className="text-xs text-neutral-400">At least 8 characters.</span>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-md bg-teal-700 hover:bg-teal-800 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </main>
  );
}
