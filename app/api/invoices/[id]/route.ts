// ============================================================
// PATCH /api/invoices/[id]  → mark PAID or FAILED (ADMIN ONLY)
// This is the "simulated payment" action from plan.md assumption 1
// — in v1 there's no real payment gateway, so an admin manually
// confirms whether an invoice was paid.
// ============================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markInvoiceStatusSchema } from "@/lib/validators";
import { markInvoiceStatus } from "@/lib/billing";

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
  const parsed = markInvoiceStatusSchema.safeParse({ ...body, invoiceId: id });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const invoice = await markInvoiceStatus(parsed.data.invoiceId, parsed.data.status);
    return NextResponse.json({ invoice });
  } catch {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
}
