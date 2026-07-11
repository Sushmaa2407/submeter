// ============================================================
// Billing engine.
//
// Two jobs live here, and they're meant to be run together,
// regularly (we'll trigger both from one cron endpoint):
//
//   1. generateDueInvoices()   — bill every subscription whose
//      current period has ended
//   2. processOverdueSubscriptions() — check unpaid invoices and
//      move subscriptions to PAST_DUE / CANCELLED on schedule
//
// Both are written to be safe to run twice in a row (idempotent).
// A cron job WILL occasionally retry or double-fire — that's
// normal infrastructure behavior, not a bug — so the code has to
// expect it, not assume it never happens.
// ============================================================
import { prisma } from "@/lib/db";
import { calculatePeriodEnd } from "@/lib/subscriptions";
import { SubscriptionStatus, InvoiceStatus, Prisma } from "@prisma/client";

const PAST_DUE_GRACE_DAYS = 3;
const CANCEL_GRACE_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface BillingRunSummary {
  invoicesCreated: number;
  subscriptionsMarkedPastDue: number;
  subscriptionsCancelled: number;
}

/**
 * Finds every ACTIVE subscription whose current billing period has
 * ended, bills it, and either renews the period or — if the
 * customer already asked to cancel — ends it for good.
 */
async function generateDueInvoices(): Promise<number> {
  const now = new Date();

  const dueSubscriptions = await prisma.subscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: { lte: now },
    },
    include: { plan: true },
  });

  let created = 0;

  for (const subscription of dueSubscriptions) {
    try {
      // The @@unique([subscriptionId, periodStart]) constraint in
      // schema.prisma is what actually guarantees we never bill the
      // same period twice, even if this function somehow runs twice
      // for the same subscription — the SECOND attempt just throws,
      // and we catch and skip it below.
      await prisma.invoice.create({
        data: {
          subscriptionId: subscription.id,
          amountCents: subscription.plan.priceCents,
          periodStart: subscription.currentPeriodStart,
          periodEnd: subscription.currentPeriodEnd,
          dueDate: subscription.currentPeriodEnd,
          status: InvoiceStatus.PENDING,
        },
      });
      created += 1;
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        // Duplicate invoice for this period — already billed, skip silently.
        continue;
      }
      throw err;
    }

    if (subscription.cancelAtPeriodEnd) {
      // Customer already asked to cancel — this was their last
      // invoice. End the subscription instead of renewing it.
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { status: SubscriptionStatus.CANCELLED },
      });
    } else {
      // Renew: roll the period forward for next time.
      const newPeriodEnd = calculatePeriodEnd(
        subscription.currentPeriodEnd,
        subscription.plan.billingInterval
      );
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          currentPeriodStart: subscription.currentPeriodEnd,
          currentPeriodEnd: newPeriodEnd,
        },
      });
    }
  }

  return created;
}

/**
 * Looks at unpaid invoices and moves their subscription along the
 * grace-period timeline we agreed on in plan.md:
 *   3 days unpaid  → PAST_DUE
 *   14 days unpaid → CANCELLED
 */
async function processOverdueSubscriptions(): Promise<{
  pastDue: number;
  cancelled: number;
}> {
  const now = new Date();
  const pastDueCutoff = new Date(now.getTime() - PAST_DUE_GRACE_DAYS * DAY_MS);
  const cancelCutoff = new Date(now.getTime() - CANCEL_GRACE_DAYS * DAY_MS);

  // Unpaid = still PENDING (customer/admin never marked it paid) or
  // FAILED (a simulated payment attempt didn't go through).
  const unpaidStatuses = [InvoiceStatus.PENDING, InvoiceStatus.FAILED];

  // Longest-overdue first, so a subscription that qualifies for
  // CANCELLED doesn't get stuck at PAST_DUE by an earlier, less
  // overdue invoice being checked first.
  const cancelCandidates = await prisma.invoice.findMany({
    where: {
      status: { in: unpaidStatuses },
      dueDate: { lte: cancelCutoff },
      subscription: { status: { not: SubscriptionStatus.CANCELLED } },
    },
    select: { subscriptionId: true },
    distinct: ["subscriptionId"],
  });

  let cancelled = 0;
  for (const { subscriptionId } of cancelCandidates) {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubscriptionStatus.CANCELLED },
    });
    cancelled += 1;
  }

  const pastDueCandidates = await prisma.invoice.findMany({
    where: {
      status: { in: unpaidStatuses },
      dueDate: { lte: pastDueCutoff, gt: cancelCutoff },
      subscription: { status: SubscriptionStatus.ACTIVE },
    },
    select: { subscriptionId: true },
    distinct: ["subscriptionId"],
  });

  let pastDue = 0;
  for (const { subscriptionId } of pastDueCandidates) {
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: SubscriptionStatus.PAST_DUE },
    });
    pastDue += 1;
  }

  return { pastDue, cancelled };
}

/** The single entry point the cron endpoint calls. */
export async function runBillingCycle(): Promise<BillingRunSummary> {
  const invoicesCreated = await generateDueInvoices();
  const { pastDue, cancelled } = await processOverdueSubscriptions();

  return {
    invoicesCreated,
    subscriptionsMarkedPastDue: pastDue,
    subscriptionsCancelled: cancelled,
  };
}

/**
 * Admin action: mark an invoice paid or failed (our simulated
 * payment step — see plan.md assumption 1). Paying an invoice for
 * a PAST_DUE subscription brings it back to ACTIVE.
 */
export async function markInvoiceStatus(
  invoiceId: string,
  newStatus: "PAID" | "FAILED"
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { subscription: true },
  });
  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: {
      status: newStatus,
      paidAt: newStatus === "PAID" ? new Date() : null,
    },
  });

  if (newStatus === "PAID" && invoice.subscription.status === SubscriptionStatus.PAST_DUE) {
    await prisma.subscription.update({
      where: { id: invoice.subscriptionId },
      data: { status: SubscriptionStatus.ACTIVE },
    });
  }

  return updatedInvoice;
}
