/**
 * The buckets the revenue chart stacks, in stacking order (bottom to top).
 *
 * These are **display** buckets, not stored statuses: the `invoices.status`
 * enum is `pending | paid | void`, and "overdue" is derived from the issue date.
 * `void` is deliberately absent — a voided invoice is cancelled, not revenue, so
 * including it would inflate every month it appears in.
 */
export const REVENUE_BUCKETS = ["paid", "pending", "overdue"] as const;

export type RevenueBucket = (typeof REVENUE_BUCKETS)[number];

/**
 * One month's revenue, split by display bucket. All amounts are **cents**,
 * matching `invoices.amount`.
 */
export type RevenuePeriodTotals = {
	/** `YYYY-MM-01` — the stored `revenue_period`, always a first-of-month. */
	readonly period: string;
	readonly overdue: number;
	readonly paid: number;
	readonly pending: number;
};
