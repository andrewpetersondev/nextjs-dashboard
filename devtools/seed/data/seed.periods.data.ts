import type { Period } from "@/shared/primitives/period/period.brand";
import { generateMonthlyPeriods } from "../seed-periods";
import { SEED_CONFIG } from "./seed.constants";

/**
 * Generated seed periods and corresponding Date values.
 */
export const periods: readonly string[] = generateMonthlyPeriods(
	"2025-01-01",
	SEED_CONFIG.generateMonthlyPeriodsCount,
);

export const periodDates: ReadonlyArray<Date & Period> = periods.map(
	(period) => new Date(`${period}T00:00:00.000Z`) as Date & Period,
);
