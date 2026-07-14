import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cancelSubscriptionSchema } from "@/lib/validators";
import { undoCancelSubscription, SubscriptionError } from "@/lib/subscriptions";

export async function POST(request: Request) {
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
    const subscription = await undoCancelSubscription(
      session.user.id,
      parsed.data.subscriptionId
    );
    return NextResponse.json({ subscription });
  } catch (err) {
    if (err instanceof SubscriptionError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
