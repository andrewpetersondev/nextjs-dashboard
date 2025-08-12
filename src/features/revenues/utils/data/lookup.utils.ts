import "server-only";

import type { RevenueDisplayEntity } from "@/features/revenues/core/revenue.entity";
import { toPeriod } from "@/features/revenues/utils/date/period.utils";
import type { Period } from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";

const PERIOD_REGEX = /^\d{4}-\d{2}$/;

const normalizePeriod = (p: string): string => {
  const [y, m] = p.split("-");
  const mm = String(Number(m)).padStart(2, "0");
  return `${y}-${mm}`;
};

const isValidPeriod = (p: string): boolean => PERIOD_REGEX.test(p);

/**
 * Creates an efficient lookup map for revenue data indexed by Period (YYYY-MM).
 *
 * - Normalizes all period keys to YYYY-MM (zero-padded month).
 * - Logs duplicate keys (later item overwrites earlier one).
 * - Avoids logging the entire map to keep logs concise.
 *
 * @param actualData - Array of revenue data from database query
 * @returns Map keyed by branded Period with corresponding revenue data
 */
export function createDataLookupMap(
  actualData: RevenueDisplayEntity[],
): Map<Period, RevenueDisplayEntity> {
  const dataMap = new Map<Period, RevenueDisplayEntity>();
  const duplicates: Period[] = [];

  for (const dataItem of actualData) {
    const periodKey = derivePeriodFromDisplayEntity(dataItem);

    if (dataMap.has(periodKey)) {
      duplicates.push(periodKey);
      logger.warn({
        context: "createDataLookupMap",
        message: "Duplicate period encountered; overwriting existing entry",
        period: periodKey,
      });
    }

    dataMap.set(periodKey, dataItem);
  }

  // For logging, only include summary info to avoid noisy/empty {} for Map
  logger.info({
    context: "createDataLookupMap",
    dataMapCount: dataMap.size,
    duplicates: [...new Set(duplicates)],
    keysSample: Array.from(dataMap.keys()).slice(0, 6), // small sample for debugging
    message: "Created data lookup map",
  });

  return dataMap;
}

/**
 * Derives a branded Period (YYYY-MM) from a RevenueDisplayEntity.
 * - Prefers entity.period if present.
 * - Otherwise constructs it from year and monthNumber.
 * - Always normalizes to YYYY-MM and validates the final format.
 */
function derivePeriodFromDisplayEntity(dataItem: RevenueDisplayEntity): Period {
  // Prefer a period field if present on the display entity
  const maybePeriod = (dataItem as unknown as { period?: string }).period;

  if (maybePeriod) {
    const normalized = normalizePeriod(maybePeriod);
    if (!isValidPeriod(normalized)) {
      throw new Error(
        `Invalid period format on entity.period: ${maybePeriod} -> ${normalized}`,
      );
    }
    return toPeriod(normalized);
  }

  // Fallback: construct from year and monthNumber fields
  const { year, monthNumber } = dataItem as unknown as {
    year?: number;
    monthNumber?: number;
  };

  if (typeof year !== "number" || typeof monthNumber !== "number") {
    throw new Error(
      "RevenueDisplayEntity missing 'period' and 'year/monthNumber' fields to derive Period",
    );
  }

  const normalized = normalizePeriod(`${year}-${monthNumber}`);
  if (!isValidPeriod(normalized)) {
    throw new Error(
      `Invalid derived period format from year/monthNumber: ${year}/${monthNumber} -> ${normalized}`,
    );
  }

  const period = toPeriod(normalized);

  logger.info({
    context: "derivePeriodFromDisplayEntity",
    message: "Derived period from the display entity",
    period,
  });

  return period;
}
