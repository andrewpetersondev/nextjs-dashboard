import "server-only";

import type { RevenueDisplayEntity } from "@/features/revenues/core/revenue.entity";
import { toPeriod } from "@/features/revenues/utils/date/period.utils";
import type { Period } from "@/lib/definitions/brands";

/**
 * Creates an efficient lookup map for revenue data indexed by Period (YYYY-MM).
 *
 * @param actualData - Array of revenue data from database query
 * @returns Map keyed by branded Period with corresponding revenue data
 *
 * @remarks
 * Time complexity: O(n) where n is the number of actual data records
 */
export function createDataLookupMap(
  actualData: RevenueDisplayEntity[],
): Map<Period, RevenueDisplayEntity> {
  const dataMap = new Map<Period, RevenueDisplayEntity>();

  actualData.forEach((dataItem) => {
    const periodKey = derivePeriodFromDisplayEntity(dataItem);
    dataMap.set(periodKey, dataItem);
  });

  return dataMap;
}

/**
 * Derives a branded Period (YYYY-MM) from a RevenueDisplayEntity.
 * Prefers entity.period if available; otherwise constructs it from year/monthNumber.
 */
function derivePeriodFromDisplayEntity(dataItem: RevenueDisplayEntity): Period {
  // Prefer a period field if present on the display entity
  const maybePeriod = (dataItem as unknown as { period?: Period }).period;
  if (maybePeriod) {
    return maybePeriod;
  }

  // Fallback: construct from year and monthNumber fields
  const { year, monthNumber } = dataItem as unknown as {
    year: number;
    monthNumber: number;
  };

  if (typeof year !== "number" || typeof monthNumber !== "number") {
    throw new Error(
      "RevenueDisplayEntity missing 'period' and 'year/monthNumber' fields to derive Period",
    );
  }

  return toPeriod(`${year}-${String(monthNumber).padStart(2, "0")}`);
}
