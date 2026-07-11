// ============================================================
// JSON-LD is a block of structured data search engines read (but
// humans don't see) to understand exactly what a page is about.
// This tells Google "this is a SoftwareApplication, free, web-based"
// — which is what unlocks rich results in search.
//
// It must be server-rendered (present in the initial HTML), never
// injected after the page loads — that's why this stays in a
// plain server component instead of a useEffect somewhere.
// ============================================================
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SubMeter",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Subscription billing platform with usage tracking, automated invoicing, and MRR/churn analytics.",
  url: siteUrl,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          SubMeter
        </h1>
        <p className="text-sm text-neutral-500">
          Subscription billing, usage tracking, and revenue analytics.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/login"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
          >
            Sign up
          </Link>
        </div>
      </main>
    </>
  );
}
