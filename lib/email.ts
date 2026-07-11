// ============================================================
// Email service — v1 STUB.
//
// Why this file exists on its own:
// Every other file that needs to send an email calls
// `sendVerificationEmail(...)` and never touches SMTP/API
// details directly. That means upgrading to real email later
// is a change to THIS FILE ONLY — nothing else in the codebase
// needs to know or care.
//
// v2 upgrade path (not built now, by design — see plan.md
// Section 8, assumption 5):
//   1. `npm install resend` (or nodemailer, sendgrid, etc.)
//   2. Replace the body of sendVerificationEmail below with a
//      real API call.
//   3. Done. No caller anywhere else changes.
// ============================================================

interface SendVerificationEmailParams {
  to: string;
  verificationToken: string;
}

export async function sendVerificationEmail({
  to,
  verificationToken,
}: SendVerificationEmailParams): Promise<void> {
  // v1: no real SMTP configured. We log instead of sending, and
  // in dev/demo we auto-verify (see auth signup flow) so the
  // trial reviewer isn't blocked by an email they'll never receive.
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verificationToken}`;

  console.log(
    `[email:stub] Verification email for ${to} — would send link: ${verifyUrl}`
  );

  // v2 real implementation looks roughly like:
  //
  // await resend.emails.send({
  //   from: "SubMeter <noreply@yourdomain.com>",
  //   to,
  //   subject: "Verify your SubMeter account",
  //   html: `<a href="${verifyUrl}">Click to verify</a>`,
  // });
}
