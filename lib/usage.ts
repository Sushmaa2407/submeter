// ============================================================
// Usage tracking logic.
//
// Per our locked decision (plan.md Section 9, Q3): usage limits
// WARN, they never BLOCK. So logUsage() never rejects a request
// for being "over the limit" — it just records it. The limit only
// affects what getUsageSummary() reports back to the UI.
// ============================================================
import { prisma } from "@/lib/db";
import { SubscriptionStatus } from "@prisma/client";
import type { UsageSummary } from "@/types";

const NEAR_LIMIT_THRESHOLD_PERCENT = 80;

export class UsageError extends Error {}

/**
 * Records a usage event against a subscription. Only allowed while
 * the subscription is ACTIVE — logging usage against something
 * already cancelled doesn't mean anything real.
 */
export async function logUsage(
  userId: string,
  subscriptionId: string,
  quantity: number
) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription || subscription.userId !== userId) {
    throw new UsageError("Subscription not found.");
  }

  if (subscription.status !== SubscriptionStatus.ACTIVE) {
    throw new UsageError("Cannot log usage against an inactive subscription.");
  }

  return prisma.usageRecord.create({
    data: { subscriptionId, quantity },
  });
}

/**
 * Sums usage recorded WITHIN THE CURRENT BILLING PERIOD ONLY — not
 * lifetime usage. A customer's meter resets when their period
 * renews, same as a phone plan's data allowance.
 */
export async function getUsageSummary(subscriptionId: string): Promise<UsageSummary> {
  const subscription = await prisma.subscription.findUniqueOrThrow({
    where: { id: subscriptionId },
    include: { plan: true },
  });

  const result = await prisma.usageRecord.aggregate({
    where: {
      subscriptionId,
      recordedAt: { gte: subscription.currentPeriodStart },
    },
    _sum: { quantity: true },
  });

  const used = result._sum.quantity ?? 0;
  const limit = subscription.plan.usageLimit; // null = unlimited

  const percentUsed = limit ? Math.round((used / limit) * 100) : null;

  return {
    used,
    limit,
    percentUsed,
    isNearLimit: percentUsed !== null && percentUsed >= NEAR_LIMIT_THRESHOLD_PERCENT,
  };
}
