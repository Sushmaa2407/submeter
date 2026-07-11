export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        SubMeter
      </h1>
      <p className="text-sm text-neutral-500">
        Subscription billing, usage tracking, and revenue analytics.
      </p>
      <div className="mt-4 flex gap-3">
        <a
          href="/login"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900"
        >
          Log in
        </a>
        <a
          href="/signup"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Sign up
        </a>
      </div>
    </main>
  );
}
