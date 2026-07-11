import type { Metadata } from "next";
import "./globals.css";

// metadataBase turns every relative URL below (like the OG image
// path) into a full absolute URL automatically — required for
// social platforms to actually fetch and display it correctly.
const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SubMeter — Subscription billing & usage analytics",
    // %s lets individual pages set just their own piece, e.g.
    // "Plans | SubMeter", instead of retyping the full title
    // everywhere.
    template: "%s | SubMeter",
  },
  description:
    "Subscription billing platform with usage tracking, automated invoicing, and MRR/churn analytics for growing SaaS businesses.",
  openGraph: {
    title: "SubMeter — Subscription billing & usage analytics",
    description:
      "Subscription billing platform with usage tracking, automated invoicing, and MRR/churn analytics.",
    url: siteUrl,
    siteName: "SubMeter",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SubMeter — Subscription billing & usage analytics",
    description:
      "Subscription billing platform with usage tracking, automated invoicing, and MRR/churn analytics.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
  // Lighthouse's SEO audit specifically checks for a valid canonical
  // tag — without one, search engines can't confirm which URL is
  // the "real" version of a page (matters more once you have query
  // params or a custom domain pointing at the same Vercel deploy).
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
