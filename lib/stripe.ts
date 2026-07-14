// ============================================================
// Stripe client singleton — same pattern as lib/db.ts (one
// instance, reused everywhere).
//
// TEST MODE, on purpose: your Stripe secret key from the
// dashboard's "Test mode" toggle starts with sk_test_... — using
// it means every "payment" here is fake money on a fake card
// number, with zero real financial risk, while still exercising
// the exact same real Stripe infrastructure a production
// integration would use.
// ============================================================
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    "STRIPE_SECRET_KEY is not set — /api/stripe/checkout will fail until it's added to .env"
  );
}

// Stripe's SDK refuses to construct at all with an empty string —
// which crashes Next.js's build step (it briefly loads every route
// module to "collect page data," even ones that are never called).
// A harmless placeholder value lets construction succeed at build
// time; any REAL request still fails clearly and safely later,
// specifically inside the checkout/webhook routes, if the actual
// env var is still missing at runtime.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_not_a_real_key");