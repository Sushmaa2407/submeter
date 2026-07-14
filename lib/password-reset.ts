// ============================================================
// Password reset — request a reset link, then use it once.
//
// Security properties this satisfies (straight from the brief):
//   - Single-use token: `usedAt` gets set the moment it's used,
//     and every lookup rejects already-used tokens
//   - Hashed at rest: we store SHA-256(token), never the token
//     itself — a database leak alone can't be used to reset anyone's
//     password
//   - 15-30 min TTL: we use 20 minutes
//   - Never emails the plaintext password — only ever a one-time
//     LINK containing a random token, never the account password
// ============================================================
import crypto from "crypto";
import { hash } from "@node-rs/argon2";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_TTL_MINUTES = 20;

function hashToken(token: string): string {
  // A deterministic hash (not Argon2) is correct here on purpose:
  // Argon2 is for low-entropy, human-chosen secrets (passwords) and
  // is deliberately slow + salted differently every time, which
  // would make it impossible to look up "does this token exist" in
  // the database. Our reset token is already high-entropy random
  // data, so a fast deterministic hash (SHA-256) is the standard,
  // correct choice here — same approach used by Rails, Django, etc.
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Starts a password reset. Deliberately does NOT reveal whether the
 * email exists — always resolves the same way either way, so this
 * endpoint can't be used to check who has an account.
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Silently do nothing — the API route returns the same generic
    // success message regardless, so an attacker can't tell accounts
    // apart by which emails "work."
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  await sendPasswordResetEmail({ to: user.email, token });
}

export class PasswordResetError extends Error {}

/** Completes a reset: validates the token, then sets the new password. */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    // Same generic error for "doesn't exist," "already used," and
    // "expired" — no reason to tell an attacker which one it was.
    throw new PasswordResetError("This reset link is invalid or has expired.");
  }

  const passwordHash = await hash(newPassword);

  // Both writes happen together: update the password AND burn the
  // token in the same transaction, so a crash between the two steps
  // can never leave a still-valid token sitting around after the
  // password's already been changed.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);
}
