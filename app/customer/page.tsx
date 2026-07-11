// ============================================================
// /customer
//
// Updated for Day 6: now also fetches this billing period's usage
// summary and shows the UsageTracker component when there's an
// active subscription.
// ============================================================
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SubscribeButton, CancelButton } from "@/components/SubscriptionButtons";
import UsageTracker from "@/components/UsageTracker";
import { getUsageSummary } from "@/lib/usage";

function StatusBadge({ status }: { status: "PENDING" | "PAID" | "FAILED" }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700",
    PAID: "bg-green-50 text-green-700",
    FAILED: "bg-red-50 text-red-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status]}`}>
      {status}
    </span>
  );
}

export default async function CustomerPage() {
  const session = await auth();
  const userId = session!.user.id;

  const activeSubscription = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
    include: { plan: true },
  });

  const availablePlans = await prisma.plan.findMany({
    where: { isArchived: false },
    orderBy: { priceCents: "asc" },
  });

  const invoices = await prisma.invoice.findMany({
    where: { subscription: { userId } },
    include: { subscription: { include: { plan: true } } },
    orderBy: { createdAt: "desc" },
  });

  const usageSummary = activeSubscription
    ? await getUsageSummary(activeSubscription.id)
    : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-neutral-900">
        Your subscription
      </h1>

      {activeSubscription ? (
        <div className="rounded-lg border border-neutral-200 p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-medium text-neutral-900">
                {activeSubscription.plan.name}
              </p>
              <p className="text-sm text-neutral-500">
                ${(activeSubscription.plan.priceCents / 100).toFixed(2)} /{" "}
                {activeSubscription.plan.billingInterval === "MONTHLY" ? "month" : "year"}
              </p>
              <p className="mt-2 text-xs text-neutral-400">
                Current period ends{" "}
                {activeSubscription.currentPeriodEnd.toLocaleDateString()}
              </p>
              {activeSubscription.cancelAtPeriodEnd && (
                <p className="mt-1 text-xs font-medium text-amber-600">
                  Cancelling at period end — you&rsquo;ll keep access until then.
                </p>
              )}
            </div>
            {!activeSubscription.cancelAtPeriodEnd && (
              <CancelButton subscriptionId={activeSubscription.id} />
            )}
          </div>
        </div>
      ) : (
        <p className="mb-6 rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          You don&apos;t have an active subscription yet. Pick a plan below.
        </p>
      )}

      {!activeSubscription && (
        <div className="mt-4 flex flex-col gap-3">
          {availablePlans.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-4"
            >
              <div>
                <p className="font-medium text-neutral-900">{plan.name}</p>
                <p className="text-sm text-neutral-500">
                  ${(plan.priceCents / 100).toFixed(2)} /{" "}
                  {plan.billingInterval === "MONTHLY" ? "month" : "year"}
                  {plan.usageLimit && ` · ${plan.usageLimit} units included`}
                </p>
              </div>
              <SubscribeButton planId={plan.id} />
            </div>
          ))}
        </div>
      )}

      {activeSubscription && usageSummary && (
        <div className="mt-6">
          <UsageTracker
            subscriptionId={activeSubscription.id}
            summary={usageSummary}
          />
        </div>
      )}

      <h2 className="mb-4 mt-10 text-lg font-semibold tracking-tight text-neutral-900">
        Billing history
      </h2>

      {invoices.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          No invoices yet — your first one is generated automatically
          at the end of your current billing period.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-neutral-900">
                  {invoice.subscription.plan.name} — $
                  {(invoice.amountCents / 100).toFixed(2)}
                </p>
                <p className="text-xs text-neutral-400">
                  Due {invoice.dueDate.toLocaleDateString()}
                </p>
              </div>
              <StatusBadge status={invoice.status} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
