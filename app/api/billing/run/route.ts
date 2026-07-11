// ============================================================
// POST /api/billing/run
//
// This is the endpoint a scheduled job (Vercel Cron, or you
// running it manually for testing) hits once a day. It's NOT
// protected by login — a cron job isn't a logged-in person — so
// instead it checks a shared secret in the Authorization header.
// Anyone without that secret gets rejected.
// ============================================================
import { NextResponse } from "next/server";
import { runBillingCycle } from "@/lib/billing";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await runBillingCycle();

  return NextResponse.json(summary);
}
