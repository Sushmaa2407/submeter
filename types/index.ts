// ============================================================
// Domain types that aren't just "a Prisma row."
// Prisma already generates types for User, Plan, Subscription,
// Invoice, UsageRecord from schema.prisma — we don't redeclare
// those here. This file is for *computed* / *composite* shapes
// that come from combining data, like dashboard stats.
// ============================================================

/** One row of the admin dashboard's headline numbers. */
export interface DashboardStats {
  mrrCents: number;              // normalized monthly recurring revenue
  activeSubscriptionCount: number;
  pastDueCount: number;
  churnRatePercent: number;      // cancelled-this-month / active-at-month-start * 100
}

/** One point on the revenue-over-time chart. */
export interface RevenuePoint {
  month: string;                 // "2026-07"
  revenueCents: number;
}

/** One slice of the plan-distribution pie chart. */
export interface PlanDistributionSlice {
  planName: string;
  subscriberCount: number;
}

/** Usage summary shown to a customer on their own dashboard. */
export interface UsageSummary {
  used: number;
  limit: number | null;          // null = unlimited
  percentUsed: number | null;    // null when limit is null
  isNearLimit: boolean;          // true when percentUsed >= 80
}

/** Generic shape every list-fetching API returns, so pagination
 *  UI can be written once and reused everywhere. */
export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
  total: number;
}

/** The three states every async UI region must render explicitly.
 *  "success" carries data; the others don't. */
export type AsyncState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "success"; data: T };
