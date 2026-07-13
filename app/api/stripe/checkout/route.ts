// ============================================================
// POST /api/stripe/checkout
//
// A customer clicks "Pay now" on one of THEIR OWN pending
// invoices. This creates a real Stripe Checkout Session (test
// mode) for that exact amount, and returns the URL to redirect
// the browser to Stripe's own hosted payment page.
//
// We deliberately do NOT mark the invoice paid here — that only
// happens once Stripe actually confirms the payment via the
// webhook (see app/api/stripe/webhook/route.ts). Trusting the
// browser's redirect back to us as "proof of payment" would let
// anyone fake success just by visiting the success URL directly.
// ============================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { invoiceId } = await request.json();

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { subscription: { include: { plan: true } } },
  });

  if (!invoice || invoice.subscription.userId !== session.user.id) {
    // Same generic error whether it doesn't exist or belongs to
    // someone else — never confirm "this invoice ID exists" to a
    // stranger poking at the API.
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status !== "PENDING") {
    return NextResponse.json({ error: "This invoice isn't payable" }, { status: 409 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: `${invoice.subscription.plan.name} — invoice` },
          unit_amount: invoice.amountCents,
        },
        quantity: 1,
      },
    ],
    // This is how the webhook knows WHICH invoice to mark paid —
    // Stripe echoes this metadata back on the completed event.
    metadata: { invoiceId: invoice.id },
    success_url: `${appUrl}/customer?payment=success`,
    cancel_url: `${appUrl}/customer?payment=cancelled`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
