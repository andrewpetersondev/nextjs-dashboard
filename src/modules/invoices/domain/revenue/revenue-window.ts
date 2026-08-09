import type { RevenuePeriodTotals } from "@/modules/invoices/domain/revenue/revenue.types";

const FIRST_DAY_OF_MONTH = 1;
const MONTH_INDEX_OFFSET = 1;
const ISO_MONTH_PAD = 2;

/**
 * Formats a UTC date as the `YYYY-MM-01` period key.
 *
 * Built from the UTC parts rather than `toISOString().slice(0, 10)` so the
 * intent is explicit, and never from local-time getters — the stored
 * `revenue_period` is a plain date, and a runner in a negative-offset zone
 * would otherwise produce the previous month for the first of the month.
 */
function toPeriodKey(date: Date): string {
	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + MONTH_INDEX_OFFSET).padStart(
		ISO_MONTH_PAD,
		"0",
	);

	return `${year}-${month}-0${FIRST_DAY_OF_MONTH}`;
}

/** How many months the overview chart covers, including the current one. */
export const REVENUE_WINDOW_MONTHS = 12;

/**
 * Every period key in the window, oldest first, ending with the month
 * containing `now`.
 *
 * `Date.UTC` normalizes a negative month index, so subtracting past January
 * rolls the year back correctly without any manual wrapping.
 */
export function enumerateRevenuePeriods(
	now: Date,
	months: number = REVENUE_WINDOW_MONTHS,
): readonly string[] {
	const firstMonthOffset = months - MONTH_INDEX_OFFSET;

	return Array.from({ length: months }, (_, index) =>
		toPeriodKey(
			new Date(
				Date.UTC(
					now.getUTCFullYear(),
					now.getUTCMonth() - firstMonthOffset + index,
					FIRST_DAY_OF_MONTH,
				),
			),
		),
	);
}

/** The oldest period in the window — the query's lower bound. */
export function revenueWindowStart(
	now: Date,
	months: number = REVENUE_WINDOW_MONTHS,
): string {
	const periods = enumerateRevenuePeriods(now, months);
	return periods[0] ?? toPeriodKey(now);
}

/**
 * Expands sparse query results into one row per month in the window.
 *
 * `GROUP BY revenue_period` only returns months that actually have invoices, so
 * plotting its output directly would **silently drop quiet months** and shift
 * every later bar left — an axis that looks continuous while lying about time.
 * A month with no invoices is a real, meaningful zero and gets an empty slot.
 */
export function fillRevenuePeriodGaps(
	rows: readonly RevenuePeriodTotals[],
	now: Date,
	months: number = REVENUE_WINDOW_MONTHS,
): readonly RevenuePeriodTotals[] {
	const byPeriod = new Map(rows.map((row) => [row.period, row]));

	return enumerateRevenuePeriods(now, months).map(
		(period) =>
			byPeriod.get(period) ?? {
				overdue: 0,
				paid: 0,
				pending: 0,
				period,
			},
	);
}
