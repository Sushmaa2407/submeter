import type { Metadata } from "next";

// login/page.tsx is "use client" (it needs useState for the form),
// and client components can't export `metadata`. This tiny
// server-only layout sits next to it purely to attach page-specific
// SEO metadata — Next.js merges it with the root layout
// automatically. No visible UI here, just a pass-through wrapper.
export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your SubMeter account.",
  alternates: {
    canonical: "/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
