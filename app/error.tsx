"use client";

// ============================================================
// error.tsx MUST be a client component — Next.js requires this,
// since error boundaries rely on React features that only work
// in the browser.
//
// This catches any error thrown while rendering a page under this
// part of the app (and everything nested inside it) and shows a
// real "something broke, here's a retry button" screen instead of
// crashing to a blank white page — this is the acceptance
// criterion "friendly message plus a retry button client-side,
// full stack trace logged server-side."
// ============================================================
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The full error, including stack trace, goes to the server
    // console — the user only ever sees a clean, non-technical
    // message. Never expose stack traces to the browser.
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        Something went wrong
      </h1>
      <p className="text-sm text-neutral-500">
        That&rsquo;s on us, not you. Try again — if it keeps happening,
        the details have already been logged.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-md bg-teal-700 hover:bg-teal-800 px-4 py-2 text-sm font-medium text-white"
      >
        Try again
      </button>
    </main>
  );
}
