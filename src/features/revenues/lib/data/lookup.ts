import { LOOKUP_LOG_KEYS_SAMPLE } from "@/features/revenues/lib/data/constants";
import { normalizeToPeriod } from "@/features/revenues/lib/data/period-normalize";
import type { RevenueDisplayRow } from "@/features/revenues/types";
import type { Period } from "@/shared/brands/domain-brands";
import { toPeriod } from "@/shared/brands/mappers";
import { logger } from "@/shared/logging/logger";
import { periodKey } from "@/shared/revenues/period";

/**
 * Creates an efficient lookup map for revenue data indexed by Period month-key.
 *
 * - Normalizes all period keys to a stable "yyyy-MM" key (first-of-month semantics).
 * - Logs duplicate keys (later item overwrites earlier one).
 * - Avoids logging the entire map to keep logs concise.
 * TODO: would it make sense to simplify the function to use "yyyy-MM-dd"
 */
export function createDataLookupMap(
  actualData: RevenueDisplayRow[],
): Map<string, RevenueDisplayRow> {
  const dataMap = new Map<string, RevenueDisplayRow>();
  const duplicates: string[] = [];

  for (const dataItem of actualData) {
    const key = periodKey(toPeriod(dataItem.period));

    if (dataMap.has(key)) {
      duplicates.push(key);
      logger.warn({
        context: "createDataLookupMap",
        message: "Duplicate period encountered; overwriting existing entry",
        period: key,
      });
    }

    dataMap.set(key, dataItem);
  }

  // For logging, only include summary info to avoid noisy/empty {} for Map
  logger.debug({
    context: "createDataLookupMap",
    dataMapCount: dataMap.size,
    duplicates: [...new Set(duplicates)],
    keysSample: Array.from(dataMap.keys()).slice(0, LOOKUP_LOG_KEYS_SAMPLE),
    message: "Created data lookup map",
  });

  return dataMap;
}

/**
 * Compute an ordered list of template periods from a rolling-month template.
 * Each template item must contain { year: number, month: number } fields.
 */
export function computeTemplatePeriods<
  T extends { year?: number; period?: Period } & (
    | { monthNumber?: number }
    | { month?: number }
  ),
>(template: T[]): Period[] {
  return template.map((t) => {
    // Prefer a direct period if present (e.g., RollingMonthData)
    const maybePeriod = (t as { period?: Period }).period;
    if (maybePeriod) {
      return maybePeriod;
    }

    // Otherwise, normalize from year/month or monthNumber
    const year = (t as { year?: number }).year;
    const monthNumber = (t as { monthNumber?: number }).monthNumber;
    const month = (t as { month?: number }).month;
    return normalizeToPeriod({ month, monthNumber, year: year as number });
  });
}
