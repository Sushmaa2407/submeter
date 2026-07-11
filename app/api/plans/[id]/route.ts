// ============================================================
// PATCH /api/plans/[id]  → edit a plan or archive it (ADMIN ONLY)
//
// Note: we never DELETE a plan for real. If customers already
// subscribed to it, deleting it would break their invoice history
// (an invoice pointing to a subscription pointing to a plan that
// no longer exists). "Archiving" is the safe version of deleting —
// it just hides the plan from new subscribers.
// ============================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updatePlanSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updatePlanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const existing = await prisma.plan.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const plan = await prisma.plan.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ plan });
}
