import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-5xl font-semibold tracking-tight text-neutral-200">404</p>
      <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
        Page not found
      </h1>
      <p className="text-sm text-neutral-500">
        That page doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        Back home
      </Link>
    </main>
  );
}
