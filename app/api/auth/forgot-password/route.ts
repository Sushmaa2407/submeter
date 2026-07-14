// ============================================================
// POST /api/auth/forgot-password
//
// Deliberately returns the exact same success response whether
// the email exists or not — this prevents "account enumeration"
// (an attacker feeding in emails to find out which ones have
// accounts on your site).
// ============================================================
import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators";
import { requestPasswordReset } from "@/lib/password-reset";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Reuse the same rate limiter as login — this endpoint sends a
  // real email, so it's just as important not to let someone spam
  // it hundreds of times a minute.
  const { allowed } = checkRateLimit(`forgot-password:${parsed.data.email}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  await requestPasswordReset(parsed.data.email);

  // Same message regardless of whether an account was found.
  return NextResponse.json({
    message: "If an account exists for that email, a reset link has been sent.",
  });
}
