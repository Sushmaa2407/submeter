// ============================================================
// POST /api/usage  → log a usage event against your own subscription
// GET  /api/usage?subscriptionId=...  → read the current-period summary
// ============================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { logUsageSchema } from "@/lib/validators";
import { logUsage, getUsageSummary, UsageError } from "@/lib/usage";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = logUsageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const record = await logUsage(
      session.user.id,
      parsed.data.subscriptionId,
      parsed.data.quantity
    );
    return NextResponse.json({ record }, { status: 201 });
  } catch (err) {
    if (err instanceof UsageError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subscriptionId = searchParams.get("subscriptionId");
  if (!subscriptionId) {
    return NextResponse.json({ error: "subscriptionId is required" }, { status: 400 });
  }

  const summary = await getUsageSummary(subscriptionId);
  return NextResponse.json({ summary });
}
