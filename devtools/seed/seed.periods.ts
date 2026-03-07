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
