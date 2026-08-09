import "server-only";
import { invoices } from "@database/schema/invoices";
import { gte, sql } from "drizzle-orm";
import type { RevenuePeriodTotals } from "@/modules/invoices/domain/revenue/revenue.types";
import type { AppDatabase } from "@/server/db/db.connection";

/**
 * Monthly revenue totals split by display bucket, oldest first.
 *
 * @param db - Database handle.
 * @param windowStart - Oldest `revenue_period` to include, as `YYYY-MM-01`.
 * @param overdueIssueCutoff - Issue-date cutoff for the derived overdue bucket.
 *   **Computed in TS from the domain's NET-terms constant and bound as a
 *   parameter — SQL never re-encodes the overdue rule.** This is the same
 *   contract `buildInvoiceListWhere` documents, and it is what keeps a bar in
 *   this chart from disagreeing with the badge on the row beneath it.
 *
 * @remarks
 * The buckets partition **stored-pending** exactly as the invoices list does:
 * `pending` is pending and not yet past due, `overdue` is pending and past due.
 * `void` is excluded entirely — a cancelled invoice is not revenue, and folding
 * it in would inflate whichever month it landed in.
 *
 * Aggregates on `revenue_period`, which carries its own index and a CHECK
 * constraint pinning it to `date_trunc('month', date)` — so the grouping key is
 * guaranteed to be a first-of-month and the scan is index-supported.
 */
export async function fetchRevenueByPeriodDal(
	db: AppDatabase,
	windowStart: string,
	overdueIssueCutoff: Date,
): Promise<RevenuePeriodTotals[]> {
	const rows = await db
		.select({
			overdue: sql<number>`coalesce(sum(${invoices.amount}) filter (
				where ${invoices.status} = 'pending'
				  and ${invoices.date} < ${overdueIssueCutoff}
			), 0)`,
			paid: sql<number>`coalesce(sum(${invoices.amount}) filter (
				where ${invoices.status} = 'paid'
			), 0)`,
			pending: sql<number>`coalesce(sum(${invoices.amount}) filter (
				where ${invoices.status} = 'pending'
				  and ${invoices.date} >= ${overdueIssueCutoff}
			), 0)`,
			period: sql<string>`to_char(${invoices.revenuePeriod}, 'YYYY-MM-DD')`,
		})
		.from(invoices)
		.where(gte(invoices.revenuePeriod, sql`${windowStart}::date`))
		.groupBy(invoices.revenuePeriod)
		.orderBy(invoices.revenuePeriod);

	// `sum()` comes back as a string from node-postgres for bigint columns, so
	// every bucket is coerced rather than trusted — a silent string would
	// concatenate instead of adding once the chart stacks the segments.
	return rows.map((row) => ({
		overdue: Number(row.overdue),
		paid: Number(row.paid),
		pending: Number(row.pending),
		period: row.period,
	}));
}
