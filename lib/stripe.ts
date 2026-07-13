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

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
