import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
        No access
      </h1>
      <p className="text-sm text-neutral-500">
        You&rsquo;re logged in, but this page is for admins only.
      </p>
      <Link
        href="/customer"
        className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        Go to your dashboard
      </Link>
    </main>
  );
}
