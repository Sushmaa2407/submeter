// ============================================================
// GET /api/invoices
//
// Admin  → every invoice, across every customer (for the admin
//          invoices page).
// Customer → only invoices belonging to their own subscription(s).
//
// Same file, different data, decided entirely by the server-side
// session role — never by anything the client claims.
// ============================================================
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";

  const invoices = await prisma.invoice.findMany({
    where: isAdmin
      ? {}
      : { subscription: { userId: session.user.id } },
    include: {
      subscription: {
        include: {
          plan: true,
          ...(isAdmin && { user: { select: { email: true } } }),
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invoices });
}
