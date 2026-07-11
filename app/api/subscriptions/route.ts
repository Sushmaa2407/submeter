// ============================================================
// POST   /api/subscriptions  → subscribe the logged-in user to a plan
// PATCH  /api/subscriptions  → cancel the logged-in user's subscription
//
// All the actual RULES (one active sub at a time, cancel is a
// no-op if already cancelling, etc.) live in lib/subscriptions.ts.
// This file's only job is: confirm who's asking, call that logic,
// translate errors into the right HTTP status.
// ============================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createSubscriptionSchema,
  cancelSubscriptionSchema,
} from "@/lib/validators";
import {
  createSubscription,
  cancelSubscription,
  SubscriptionError,
} from "@/lib/subscriptions";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const subscription = await createSubscription(
      session.user.id,
      parsed.data.planId
    );
    return NextResponse.json({ subscription }, { status: 201 });
  } catch (err) {
    if (err instanceof SubscriptionError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err; // an unexpected error — let it surface as a real 500, don't hide it
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = cancelSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const subscription = await cancelSubscription(
      session.user.id,
      parsed.data.subscriptionId
    );
    return NextResponse.json({ subscription });
  } catch (err) {
    if (err instanceof SubscriptionError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}
