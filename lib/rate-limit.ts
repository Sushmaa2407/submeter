// ============================================================
// Rate limiter — v1 STUB, same philosophy as lib/email.ts.
//
// What it does: blocks an email+IP combo after 5 failed login
// attempts in 15 minutes, so someone can't sit there guessing
// passwords forever.
//
// The honest limitation: this stores attempts in a plain
// in-memory Map. That's fine for local dev and even fine for a
// single-instance deploy, but on a serverless platform (Vercel)
// running multiple instances, each instance has its OWN memory —
// so this doesn't perfectly protect a production app with real
// scale.
//
// v2 upgrade path: swap the Map below for Upstash Redis
// (a few lines, same function signature) — every caller of
// `checkRateLimit` stays exactly the same.
// ============================================================

const attempts = new Map<string, { count: number; resetAt: number }>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterSeconds: Math.ceil((record.resetAt - now) / 1000) };
  }

  record.count += 1;
  return { allowed: true };
}

/** Call this on a SUCCESSFUL login to clear the counter immediately. */
export function resetRateLimit(key: string): void {
  attempts.delete(key);
}
