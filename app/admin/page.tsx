// ============================================================
// /admin — the real dashboard, replacing Day 3's placeholder.
//
// Server component: all the number-crunching (lib/dashboard.ts)
// runs on the server, and only the final small numbers/arrays are
// sent down. The charts themselves are client components since
// recharts needs the browser.
// ============================================================
import { getDashboardStats, getRevenueOverTime, getPlanDistribution } from "@/lib/dashboard";
import RevenueChart from "@/components/RevenueChart";
import PlanDistributionChart from "@/components/PlanDistributionChart";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-neutral-400">{hint}</p>}
    </div>
  );
}

export default async function AdminDashboardPage() {
  // Fetch everything in parallel — these three don't depend on
  // each other, so there's no reason to wait for one before
  // starting the next.
  const [stats, revenuePoints, planDistribution] = await Promise.all([
    getDashboardStats(),
    getRevenueOverTime(6),
    getPlanDistribution(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Dashboard
        </h1>
        <div className="flex gap-4 text-sm">
          <a href="/admin/plans" className="text-neutral-500 underline">
            Plans
          </a>
          <a href="/admin/invoices" className="text-neutral-500 underline">
            Invoices
          </a>
          <a href="/admin/usage" className="text-neutral-500 underline">
            Usage
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="MRR"
          value={`$${(stats.mrrCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          hint="Monthly recurring revenue"
        />
        <StatCard label="Active subscribers" value={String(stats.activeSubscriptionCount)} />
        <StatCard
          label="Past due"
          value={String(stats.pastDueCount)}
          hint={stats.pastDueCount > 0 ? "Needs attention" : undefined}
        />
        <StatCard
          label="Churn rate"
          value={`${stats.churnRatePercent}%`}
          hint="This month, approximate"
        />
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            Revenue — last 6 months
          </h2>
          <RevenueChart data={revenuePoints} />
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-neutral-700">
            Active subscribers by plan
          </h2>
          <PlanDistributionChart data={planDistribution} />
        </div>
      </div>
    </main>
  );
}
