import { SEED_CONFIG } from "@devtools/seed/data/seed.constants";
import { generateMonthlyPeriods } from "@devtools/seed/seed-periods";

/**
 * Generated seed periods.
 */
export const periods: readonly string[] = generateMonthlyPeriods(
	"2025-01-01",
	SEED_CONFIG.generateMonthlyPeriodsCount,
);
