// ============================================================
// /admin/plans
//
// This is a SERVER component (no "use client" at the top) —
// it fetches directly from the database while the page is being
// built on the server, before anything is sent to the browser.
// That means no loading spinner is needed for the initial list;
// the data is just already there when the page arrives.
//
// Access control note: middleware.ts already blocks non-admins
// from ever reaching this URL. We don't re-check role here — that
// would be redundant, since middleware runs first, on every request,
// for every route matching /admin/*.
// ============================================================
import { prisma } from "@/lib/db";
import PlanForm from "@/components/PlanForm";
import ArchiveButton from "@/components/ArchiveButton";

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { subscriptions: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900">
        Plans
      </h1>

      <PlanForm />

      <div className="mt-8">
        {plans.length === 0 ? (
          // EMPTY STATE — required by our acceptance criteria, not
          // an afterthought. A blank table with no explanation reads
          // as broken; this reads as "nothing here yet, here's what to do."
          <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            No plans yet. Create your first one above.
          </p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
                <th className="py-2">Name</th>
                <th className="py-2">Price</th>
                <th className="py-2">Interval</th>
                <th className="py-2">Subscribers</th>
                <th className="py-2">Status</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-b border-neutral-100">
                  <td className="py-3 font-medium text-neutral-900">{plan.name}</td>
                  <td className="py-3 text-neutral-700">
                    ${(plan.priceCents / 100).toFixed(2)}
                  </td>
                  <td className="py-3 text-neutral-700">
                    {plan.billingInterval === "MONTHLY" ? "Monthly" : "Yearly"}
                  </td>
                  <td className="py-3 text-neutral-700">
                    {plan._count.subscriptions}
                  </td>
                  <td className="py-3">
                    {plan.isArchived ? (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                        Archived
                      </span>
                    ) : (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <ArchiveButton planId={plan.id} isArchived={plan.isArchived} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
