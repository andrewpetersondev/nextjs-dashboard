import type { Period } from "@database";
import { SEED_CONFIG } from "@devtools/seed/data/seed.constants";
import {
	generateMonthlyPeriods,
	toPeriodDate,
} from "@devtools/seed/seed-periods";

/**
 * Generated seed periods and corresponding Date values.
 */
export const periods: readonly string[] = generateMonthlyPeriods(
	"2025-01-01",
	SEED_CONFIG.generateMonthlyPeriodsCount,
);

export const periodDates: ReadonlyArray<Date & Period> = periods.map((period) =>
	toPeriodDate(period),
);
