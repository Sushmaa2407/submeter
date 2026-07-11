import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your SubMeter account — takes about 10 seconds.",
  alternates: {
    canonical: "/signup",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
