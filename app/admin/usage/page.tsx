import { prisma } from "@/lib/db";
import { getUsageSummary } from "@/lib/usage";

export const dynamic = "force-dynamic";

export default async function AdminUsagePage() {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: "ACTIVE" },
    include: { plan: true, user: true },
  });

  // getUsageSummary does one database query per subscription. For a
  // trial-scale app this is completely fine; if this were handling
  // thousands of subscriptions, this loop is exactly where you'd
  // switch to one batched aggregate query instead.
  const rows = await Promise.all(
    activeSubscriptions.map(async (sub) => ({
      sub,
      summary: await getUsageSummary(sub.id),
    }))
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900">
        Usage
      </h1>

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No active subscriptions yet.
        </p>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">
              <th className="py-2">Customer</th>
              <th className="py-2">Plan</th>
              <th className="py-2">Usage this period</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows
              // Near/over-limit customers first — they're the ones
              // an admin actually needs to act on.
              .sort((a, b) => (b.summary.percentUsed ?? 0) - (a.summary.percentUsed ?? 0))
              .map(({ sub, summary }) => (
                <tr key={sub.id} className="border-b border-neutral-100">
                  <td className="py-3 text-neutral-700">{sub.user.email}</td>
                  <td className="py-3 text-neutral-700">{sub.plan.name}</td>
                  <td className="py-3 text-neutral-700">
                    {summary.used}
                    {summary.limit ? ` / ${summary.limit}` : " (unlimited)"}
                  </td>
                  <td className="py-3">
                    {summary.isNearLimit && (
                      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                        Near limit
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
