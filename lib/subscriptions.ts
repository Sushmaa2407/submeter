// ============================================================
// Subscription business logic.
//
// Why this lives in its own file instead of inside the API route:
// the RULES for subscribing/cancelling (like "only one active
// subscription per user") are important enough that we want them
// tested and reused, not buried inside a route handler. API routes
// should mostly just: check who's asking, call one of these
// functions, and return the result.
// ============================================================
import { prisma } from "@/lib/db";
import { BillingInterval, SubscriptionStatus } from "@prisma/client";

/** Given a plan's billing interval, compute when the current period ends. */
export function calculatePeriodEnd(from: Date, interval: BillingInterval): Date {
  const end = new Date(from);
  if (interval === "MONTHLY") {
    end.setMonth(end.getMonth() + 1);
  } else {
    end.setFullYear(end.getFullYear() + 1);
  }
  return end;
}

export class SubscriptionError extends Error {}

/**
 * Creates a new subscription for a user, enforcing the "one active
 * subscription at a time" rule we locked in during planning.
 */
export async function createSubscription(userId: string, planId: string) {
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan || plan.isArchived) {
    throw new SubscriptionError("This plan is not available.");
  }

  const existingActive = await prisma.subscription.findFirst({
    where: { userId, status: SubscriptionStatus.ACTIVE },
  });
  if (existingActive) {
    throw new SubscriptionError(
      "You already have an active subscription. Cancel it before subscribing to a new plan."
    );
  }

  const now = new Date();
  const periodEnd = calculatePeriodEnd(now, plan.billingInterval);

  return prisma.subscription.create({
    data: {
      userId,
      planId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
    include: { plan: true },
  });
}

/**
 * Cancels a subscription. Per our locked decision, this does NOT
 * cut off access immediately — it flags the subscription to stop
 * renewing, but the customer keeps access until the period they
 * already paid for actually ends. A separate billing job (Day 5)
 * is what flips status to CANCELLED once the period passes.
 */
export async function cancelSubscription(userId: string, subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription || subscription.userId !== userId) {
    // Same generic error whether it doesn't exist or belongs to
    // someone else — never confirm "this ID belongs to someone".
    throw new SubscriptionError("Subscription not found.");
  }

  if (subscription.cancelAtPeriodEnd) {
    // Already cancelling — treat a repeat click as a harmless no-op,
    // not an error (protects against double-click races).
    return subscription;
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { cancelAtPeriodEnd: true },
  });
}

/**
 * Reverses a pending cancellation — the "Undo" action on the toast
 * shown right after cancelling. Only works while the subscription
 * hasn't actually ended yet (still ACTIVE with cancelAtPeriodEnd
 * true); once the billing job has already flipped it to CANCELLED,
 * there's nothing left to undo — that's a real ending, not a flag.
 */
export async function undoCancelSubscription(userId: string, subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription || subscription.userId !== userId) {
    throw new SubscriptionError("Subscription not found.");
  }

  if (subscription.status !== SubscriptionStatus.ACTIVE || !subscription.cancelAtPeriodEnd) {
    throw new SubscriptionError("This subscription isn't pending cancellation.");
  }

  return prisma.subscription.update({
    where: { id: subscriptionId },
    data: { cancelAtPeriodEnd: false },
  });
}
