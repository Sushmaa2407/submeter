// ============================================================
// POST /api/stripe/webhook
//
// Stripe calls THIS endpoint directly (not the browser) once a
// payment actually succeeds. This is what makes the payment
// "real" instead of trust-the-browser: we verify the request
// genuinely came from Stripe using a signing secret, then read
// which invoice it was for, then mark it paid using the exact
// same markInvoiceStatus() function the admin's manual
// "mark paid" button already used — so past_due → active
// recovery logic is never duplicated.
// ============================================================
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { markInvoiceStatus } from "@/lib/billing";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // This is the actual security check — without it, anyone could
    // POST a fake "payment succeeded" JSON body to this URL and
    // mark any invoice paid for free. constructEvent cryptographically
    // verifies Stripe itself sent this, using the raw body + secret.
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const invoiceId = checkoutSession.metadata?.invoiceId;

    if (invoiceId) {
      try {
        await markInvoiceStatus(invoiceId, "PAID");
      } catch (err) {
        // Log but still return 200 — returning an error here makes
        // Stripe retry the webhook repeatedly, which won't help if
        // the invoice genuinely doesn't exist anymore.
        console.error(`Failed to mark invoice ${invoiceId} paid:`, err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
