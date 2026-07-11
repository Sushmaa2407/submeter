// ============================================================
// Dashboard aggregation logic.
//
// This file turns raw database rows into the summarized numbers
// an admin actually wants to see. Keeping the math here (instead
// of inline in the page) means it's testable on its own and the
// page component stays about "fetch this, render that."
// ============================================================
import { prisma } from "@/lib/db";
import { SubscriptionStatus, InvoiceStatus } from "@prisma/client";
import type { DashboardStats, RevenuePoint, PlanDistributionSlice } from "@/types";

/**
 * MRR = Monthly Recurring Revenue. Every ACTIVE subscription's
 * price counts, but a YEARLY plan is divided by 12 first — a
 * $1200/year plan contributes $100 to MRR, same as a $100/month
 * plan would. This normalization is what makes MRR comparable
 * across plans with different billing intervals.
 */
async function calculateMRR(): Promise<number> {
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: SubscriptionStatus.ACTIVE },
    include: { plan: true },
  });

  return activeSubscriptions.reduce((total, sub) => {
    const monthlyEquivalent =
      sub.plan.billingInterval === "YEARLY"
        ? Math.round(sub.plan.priceCents / 12)
        : sub.plan.priceCents;
    return total + monthlyEquivalent;
  }, 0);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [mrrCents, activeSubscriptionCount, pastDueCount, cancelledThisMonth] =
    await Promise.all([
      calculateMRR(),
      prisma.subscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
      prisma.subscription.count({ where: { status: SubscriptionStatus.PAST_DUE } }),
      prisma.subscription.count({
        where: {
          status: SubscriptionStatus.CANCELLED,
          // We don't store a separate "cancelledAt" timestamp — the
          // plan didn't call for one, and `updatedAt` already
          // changes to the moment status flips to CANCELLED, so we
          // reuse it here rather than adding a redundant column.
          updatedAt: { gte: startOfMonth },
        },
      }),
    ]);

  // HONEST LIMITATION: true churn rate needs "how many were active
  // at the START of the month," which requires a daily snapshot
  // history we don't keep in v1 (see plan.md — out of scope for the
  // 10-day build). We approximate "active at start of month" as
  // (active now + cancelled this month), which is exact UNLESS new
  // subscriptions were also created this month — a genuine
  // approximation, not a precise historical figure.
  const approxActiveAtMonthStart = activeSubscriptionCount + cancelledThisMonth;
  const churnRatePercent =
    approxActiveAtMonthStart === 0
      ? 0
      : Math.round((cancelledThisMonth / approxActiveAtMonthStart) * 1000) / 10;

  return {
    mrrCents,
    activeSubscriptionCount,
    pastDueCount,
    churnRatePercent,
  };
}

/**
 * Revenue actually collected (PAID invoices only — a PENDING
 * invoice isn't revenue yet), grouped by the month it was paid,
 * for the last `months` months.
 */
export async function getRevenueOverTime(months = 6): Promise<RevenuePoint[]> {
  const now = new Date();
  const points: RevenuePoint[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);

    const result = await prisma.invoice.aggregate({
      where: {
        status: InvoiceStatus.PAID,
        paidAt: { gte: monthStart, lt: monthEnd },
      },
      _sum: { amountCents: true },
    });

    points.push({
      month: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`,
      revenueCents: result._sum.amountCents ?? 0,
    });
  }

  return points;
}

export async function getPlanDistribution(): Promise<PlanDistributionSlice[]> {
  const grouped = await prisma.subscription.groupBy({
    by: ["planId"],
    where: { status: SubscriptionStatus.ACTIVE },
    _count: { _all: true },
  });

  const plans = await prisma.plan.findMany({
    where: { id: { in: grouped.map((g) => g.planId) } },
  });

  return grouped.map((g) => ({
    planName: plans.find((p) => p.id === g.planId)?.name ?? "Unknown",
    subscriberCount: g._count._all,
  }));
}
