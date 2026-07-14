// ============================================================
// Email service — now REAL, using Resend.
//
// This replaces the v1 stub. Note it still has a graceful
// fallback: if RESEND_API_KEY isn't set yet, it logs instead of
// crashing — so the app keeps working while you're getting your
// API key set up, instead of breaking signup entirely.
// ============================================================
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface SendVerificationEmailParams {
  to: string;
  verificationToken: string;
}

export async function sendVerificationEmail({
  to,
  verificationToken,
}: SendVerificationEmailParams): Promise<void> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verificationToken}`;

  if (!resend) {
    console.log(
      `[email:stub] RESEND_API_KEY not set — would send verification link to ${to}: ${verifyUrl}`
    );
    return;
  }

  try {
    await resend.emails.send({
      // Resend's shared "onboarding@resend.dev" sender works
      // immediately with zero setup, but ONLY delivers to the email
      // address you signed up to Resend with — that's a Resend
      // sandbox restriction, not a bug in this code. To email real
      // arbitrary users, verify your own domain in Resend's
      // dashboard and change this "from" address to something
      // like "SubMeter <noreply@yourdomain.com>".
      from: "SubMeter <onboarding@resend.dev>",
      to,
      subject: "Verify your SubMeter account",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 20px;">Verify your email</h1>
          <p>Click the link below to verify your SubMeter account:</p>
          <a href="${verifyUrl}" style="display:inline-block; background:#171717; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none;">
            Verify email
          </a>
        </div>
      `,
    });
  } catch (err) {
    // Never let an email failure block signup — log it and move on.
    // A user who never gets a verification email is a bad
    // experience; a user who can't sign up at all because of an
    // email provider hiccup is much worse.
    console.error("Failed to send verification email:", err);
  }
}

/** Sent when a customer's invoice is generated, if they want a heads-up. */
export async function sendInvoiceCreatedEmail({
  to,
  amountCents,
  dueDate,
}: {
  to: string;
  amountCents: number;
  dueDate: Date;
}): Promise<void> {
  if (!resend) {
    console.log(
      `[email:stub] Would send invoice notice to ${to}: $${(amountCents / 100).toFixed(2)} due ${dueDate.toDateString()}`
    );
    return;
  }

  try {
    await resend.emails.send({
      from: "SubMeter <onboarding@resend.dev>",
      to,
      subject: "Your SubMeter invoice is ready",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 20px;">New invoice</h1>
          <p>$${(amountCents / 100).toFixed(2)} is due on ${dueDate.toDateString()}.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer" style="display:inline-block; background:#171717; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none;">
            Pay now
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send invoice email:", err);
  }
}

/** Sent when a customer requests a password reset. */
export async function sendPasswordResetEmail({
  to,
  token,
}: {
  to: string;
  token: string;
}): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  if (!resend) {
    console.log(`[email:stub] Would send password reset link to ${to}: ${resetUrl}`);
    return;
  }

  try {
    await resend.emails.send({
      from: "SubMeter <onboarding@resend.dev>",
      to,
      subject: "Reset your SubMeter password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 20px;">Reset your password</h1>
          <p>This link expires in 20 minutes. If you didn't request this, you can safely ignore this email.</p>
          <a href="${resetUrl}" style="display:inline-block; background:#0f766e; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none;">
            Reset password
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send password reset email:", err);
  }
}

/** Sent when a payment is actually confirmed via Stripe's webhook. */
export async function sendPaymentReceivedEmail({
  to,
  amountCents,
}: {
  to: string;
  amountCents: number;
}): Promise<void> {
  if (!resend) {
    console.log(
      `[email:stub] Would send payment confirmation to ${to}: $${(amountCents / 100).toFixed(2)}`
    );
    return;
  }

  try {
    await resend.emails.send({
      from: "SubMeter <onboarding@resend.dev>",
      to,
      subject: "Payment received — thank you",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 20px;">Payment received</h1>
          <p>We've received your payment of $${(amountCents / 100).toFixed(2)}. Thanks!</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/customer" style="display:inline-block; background:#0f766e; color:#fff; padding:10px 20px; border-radius:6px; text-decoration:none;">
            View your account
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send payment confirmation email:", err);
  }
}
