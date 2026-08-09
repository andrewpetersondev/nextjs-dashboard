import { SEED_CONFIG } from "@devtools/seed/data/seed.constants";
import { generateMonthlyPeriodsEndingNow } from "@devtools/seed/seed-periods";

/**
 * Seed periods, ending with the month containing today.
 *
 * Anchored to `now` rather than a fixed start date: a literal start meant the
 * seeded window drifted further into the past every month, and by 2026-08 the
 * newest seeded month was already July — leaving the dashboard's 12-month chart
 * with an empty final bar and no genuinely-pending invoices anywhere.
 */
export const periods: readonly string[] = generateMonthlyPeriodsEndingNow(
	SEED_CONFIG.generateMonthlyPeriodsCount,
);
