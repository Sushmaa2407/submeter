"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false, // handle the redirect ourselves so we can show errors inline
    });

    if (result?.error) {
      setIsSubmitting(false);
      setError(
        result.error === "TooManyAttempts"
          ? "Too many attempts. Try again in a few minutes."
          : "Incorrect email or password."
      );
      return;
    }

    // `result` from signIn doesn't include the role — it only tells
    // us whether login succeeded. To find out WHO just logged in
    // (and therefore where to send them), we ask for the session
    // that was just created.
    const session = await getSession();
    setIsSubmitting(false);

    if (session?.user?.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/customer");
    }
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-neutral-900">
        Log in
      </h1>
      <p className="mb-6 text-sm text-neutral-500">
        Demo login: demo@demo.com / demo1234 (customer) or admin@demo.com / demo1234 (admin)
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
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-neutral-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-neutral-500">
        No account?{" "}
        <a href="/signup" className="font-medium text-neutral-900 underline">
          Sign up
        </a>
      </p>
    </main>
  );
}
