"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setIsSubmitting(false);
    // We show the same "submitted" screen regardless of the actual
    // response — the API itself never reveals whether the email
    // existed, and neither should the UI.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 text-center">
        <h1 className="mb-2 text-xl font-semibold tracking-tight text-neutral-900">
          Check your email
        </h1>
        <p className="text-sm text-neutral-500">
          If an account exists for {email}, we&rsquo;ve sent a link to reset your password. It expires in 20 minutes.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-neutral-900">
        Forgot password
      </h1>
      <p className="mb-6 text-sm text-neutral-500">
        Enter your email and we&rsquo;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-md bg-teal-700 hover:bg-teal-800 px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
        >
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        <Link href="/login" className="font-medium text-neutral-900 underline">
          Back to log in
        </Link>
      </p>
    </main>
  );
}
