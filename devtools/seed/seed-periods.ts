import type { Period } from "@database/schema/schema.types";
import { SEED_CONFIG } from "@devtools/seed/data/seed.constants";

/**
 * Validates that a period string represents the first day of a month.
 */
function validatePeriod(period: string): void {
	const date = new Date(`${period}T00:00:00.000Z`);
	if (date.getUTCDate() !== SEED_CONFIG.firstDayOfMonth) {
		throw new Error(`Generated period ${period} is not first day of month`);
	}
}

function parsePeriodParts(period: string): {
	readonly year: number;
	readonly month: number;
} {
	const parts = period.split("-");

	if (parts.length < 2) {
		throw new Error(`Invalid period format: ${period}. Expected YYYY-MM-DD`);
	}

	const yearPart = parts[0];
	const monthPart = parts[1];

	if (yearPart === undefined || monthPart === undefined) {
		throw new Error(`Invalid period format: ${period}. Expected YYYY-MM-DD`);
	}

	const year = Number.parseInt(yearPart, 10);
	const month = Number.parseInt(monthPart, 10);

	if (
		Number.isNaN(year) ||
		Number.isNaN(month) ||
		month < SEED_CONFIG.minMonth ||
		month > SEED_CONFIG.monthsInYear
	) {
		throw new Error(`Invalid period format: ${period}. Expected YYYY-MM-DD`);
	}

	return { month, year };
}

/**
 * Generate first-of-month periods as YYYY-MM-DD strings.
 *
 * Private: the only caller is `generateMonthlyPeriodsEndingNow`, which is the
 * form the seed should use — a caller supplying its own start date is how the
 * window came to drift out of date in the first place.
 */
function generateMonthlyPeriods(start: string, months: number): string[] {
	if (!start) {
		throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
	}
	if (!months || months < 0) {
		throw new Error(
			`Invalid months count: ${months}. Must be a positive integer.`,
		);
	}

	const parts = start.split("-");
	if (parts.length < 2) {
		throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
	}

	const yearPart = parts[0];
	const monthPart = parts[1];

	if (yearPart === undefined || monthPart === undefined) {
		throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
	}

	const year = Number.parseInt(yearPart, 10);
	const month = Number.parseInt(monthPart, 10);

	if (Number.isNaN(year) || Number.isNaN(month)) {
		throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
	}

	const out: string[] = [];
	for (let i = 0; i < months; i++) {
		const currentYear =
			year + Math.floor((month - 1 + i) / SEED_CONFIG.monthsInYear);
		const currentMonth = ((month - 1 + i) % SEED_CONFIG.monthsInYear) + 1;
		const d = new Date(
			Date.UTC(currentYear, currentMonth - 1, SEED_CONFIG.firstDayOfMonth),
		);
		const iso = d.toISOString().slice(0, 10);
		out.push(iso);
	}
	return out;
}

/**
 * Build an invoice date on a chosen day within a period.
 *
 * @param period - `YYYY-MM-01`.
 * @param dayOfMonth - Requested day; clamped to the month's real length, and —
 *   for the month containing `now` — to today, so the seed never produces
 *   future-dated invoices.
 */
export function buildInvoiceDateForPeriod(
	period: string,
	dayOfMonth: number,
	now: Date = new Date(),
): {
	readonly invoiceDate: Date;
	readonly revenuePeriod: Period;
} {
	validatePeriod(period);

	const revenuePeriod = new Date(`${period}T00:00:00.000Z`) as Period;
	const { year, month } = parsePeriodParts(period);

	const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
	const isCurrentMonth =
		year === now.getUTCFullYear() && month === now.getUTCMonth() + 1;
	// A demo that shows invoices dated next week reads as broken data, so the
	// current month is capped at today rather than at its full length.
	const lastAllowedDay = isCurrentMonth
		? Math.min(daysInMonth, now.getUTCDate())
		: daysInMonth;

	const day = Math.min(
		Math.max(dayOfMonth, SEED_CONFIG.firstDayOfMonth),
		lastAllowedDay,
	);
	const invoiceDate = new Date(Date.UTC(year, month - 1, day));

	return { invoiceDate, revenuePeriod };
}

/**
 * Derive the `revenuePeriod` for an arbitrary date.
 *
 * Used by the anchor invoices, which are positioned relative to `now` (e.g.
 * "60 days ago") rather than picked from a period. The database CHECK
 * constraint requires `revenue_period = date_trunc('month', date)`, so the
 * period must be derived from the date and never chosen independently.
 */
export function revenuePeriodForDate(date: Date): Period {
	return new Date(
		Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
	) as Period;
}

/**
 * The `YYYY-MM-01` period keys for the `months` months ending with the month
 * containing `now`.
 *
 * @remarks
 * Replaces a hardcoded start date. That literal meant the seeded window drifted
 * further into the past every month: by 2026-08 it already ended in July,
 * leaving the current month with no invoices at all and the dashboard's
 * 12-month chart missing its most recent bar. Anchoring to `now` makes a fresh
 * clone look the same in a year as it does today.
 */
export function generateMonthlyPeriodsEndingNow(
	months: number,
	now: Date = new Date(),
): string[] {
	const firstMonthOffset = months - 1;
	const start = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - firstMonthOffset, 1),
	);
	const startKey = `${start.getUTCFullYear()}-${String(
		start.getUTCMonth() + 1,
	).padStart(2, "0")}-01`;

	return generateMonthlyPeriods(startKey, months);
}
