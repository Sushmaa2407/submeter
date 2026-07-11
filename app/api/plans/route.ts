// ============================================================
// GET  /api/plans  → list plans (everyone can see non-archived ones;
//                    admins additionally see archived ones)
// POST /api/plans  → create a new plan (ADMIN ONLY)
// ============================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPlanSchema } from "@/lib/validators";

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const plans = await prisma.plan.findMany({
    where: isAdmin ? {} : { isArchived: false },
    orderBy: { priceCents: "asc" },
  });

  return NextResponse.json({ plans });
}

export async function POST(request: Request) {
  const session = await auth();

  // Server-side role check — this is the check that actually
  // matters. Never trust a role sent from the client; always
  // re-verify against the signed session on the server.
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createPlanSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const plan = await prisma.plan.create({ data: parsed.data });

  return NextResponse.json({ plan }, { status: 201 });
}
