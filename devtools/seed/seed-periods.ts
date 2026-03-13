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
 * Convert a period string to its branded UTC date value.
 */
export function toPeriodDate(period: string): Date & Period {
	validatePeriod(period);
	return new Date(`${period}T00:00:00.000Z`) as Date & Period;
}

/**
 * Build a random invoice date within a valid period.
 */
export function buildInvoiceDateForPeriod(period: string): {
	readonly invoiceDate: Date;
	readonly revenuePeriod: Period;
} {
	validatePeriod(period);

	const revenuePeriod = new Date(`${period}T00:00:00.000Z`) as Period;
	const { year, month } = parsePeriodParts(period);

	const daysInMonth = new Date(year, month, 0).getDate();
	const randomDay =
		Math.floor(Math.random() * daysInMonth) + SEED_CONFIG.firstDayOfMonth;
	const invoiceDate = new Date(Date.UTC(year, month - 1, randomDay));

	return { invoiceDate, revenuePeriod };
}

/**
 * Generate first-of-month periods as YYYY-MM-DD strings.
 */
export function generateMonthlyPeriods(
	start: string,
	months: number,
): string[] {
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
