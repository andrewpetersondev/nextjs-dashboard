import { SEED_CONFIG } from "./data/seed.constants";

/**
 * Validates that a period string represents the first day of a month.
 */
export function validatePeriod(period: string): void {
	const date = new Date(`${period}T00:00:00.000Z`);
	if (date.getUTCDate() !== SEED_CONFIG.firstDayOfMonth) {
		throw new Error(`Generated period ${period} is not first day of month`);
	}
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
	const [yearStr, monthStr] = start.split("-");
	if (!(yearStr && monthStr)) {
		throw new Error(`Invalid date format: ${start}. Expected YYYY-MM-DD`);
	}
	const year = Number.parseInt(yearStr, 10);
	const month = Number.parseInt(monthStr, 10);
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
