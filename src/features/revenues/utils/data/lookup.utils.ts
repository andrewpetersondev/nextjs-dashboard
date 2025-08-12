import "server-only";

import { ValidationError } from "@/errors/errors";
import type { RevenueDisplayEntity } from "@/features/revenues/core/revenue.entity";
import { toPeriod } from "@/features/revenues/utils/date/period.utils";
import type { Period } from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";

const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

const normalizePeriod = (p: string): string => {
  const [y, m] = p.split("-");
  const mm = String(Number(m)).padStart(2, "0");
  return `${y}-${mm}`;
};

const isValidPeriod = (p: string): boolean => PERIOD_REGEX.test(p);

/**
 * Normalize any acceptable input into a branded Period (YYYY-MM).
 * Accepts:
 * - string like "2025-7" or "2025-07"
 * - { year, month } object
 */
export function normalizeToPeriod(
  input: string | { year: number; month?: number; monthNumber?: number },
): Period {
  if (typeof input === "string") {
    const normalized = normalizePeriod(input);
    if (!isValidPeriod(normalized)) {
      throw new ValidationError(
        `Invalid period string: ${input} -> ${normalized}`,
      );
    }
    return toPeriod(normalized);
  }

  const { year } = input;
  const monthValue =
    (input as { monthNumber?: number }).monthNumber ??
    (input as { month?: number }).month;
  const normalized = normalizePeriod(`${year}-${monthValue}`);
  if (!isValidPeriod(normalized)) {
    throw new ValidationError(
      `Invalid year/month input: ${year}/${monthValue} -> ${normalized}`,
    );
  }
  return toPeriod(normalized);
}

/**
 * Creates an efficient lookup map for revenue data indexed by Period (YYYY-MM).
 *
 * - Normalizes all period keys to YYYY-MM (zero-padded month).
 * - Logs duplicate keys (later item overwrites earlier one).
 * - Avoids logging the entire map to keep logs concise.
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
  logger.debug({
    context: "createDataLookupMap",
    dataMapCount: dataMap.size,
    duplicates: [...new Set(duplicates)],
    keysSample: Array.from(dataMap.keys()).slice(0, 6),
    message: "Created data lookup map",
  });

  return dataMap;
}

/**
 * Compute an ordered list of template periods (YYYY-MM) from a rolling-month template.
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
    if (maybePeriod) return maybePeriod;

    // Otherwise, normalize from year/month or monthNumber
    const year = (t as { year?: number }).year;
    const monthNumber = (t as { monthNumber?: number }).monthNumber;
    const month = (t as { month?: number }).month;
    return normalizeToPeriod({ month, monthNumber, year: year as number });
  });
}

/**
 * Build a diagnostics report comparing actual data vs template periods.
 * Useful before/around merges to pinpoint missing/unexpected periods.
 */
export function makeCoverageReport<
  T extends { year: number } & ({ monthNumber: number } | { month: number }),
>(actualData: RevenueDisplayEntity[], template: T[]) {
  const periods: Period[] = actualData.map((d) =>
    derivePeriodFromDisplayEntity(d),
  );
  const templatePeriods: Period[] = computeTemplatePeriods(template);

  const duplicates: Period[] = [
    ...new Set(periods.filter((p, i) => periods.indexOf(p) !== i)),
  ];
  const invalidFormat = periods.filter((p) => !PERIOD_REGEX.test(p));
  const missing = templatePeriods.filter((p) => !periods.includes(p));
  const unexpected = periods.filter((p) => !templatePeriods.includes(p));
  const badRevenue = actualData
    .filter((d) => Number.isNaN(d.revenue))
    .map((d) => derivePeriodFromDisplayEntity(d));

  return {
    badRevenue,
    duplicates,
    invalidFormat,
    missing,
    periods,
    templatePeriods,
    unexpected,
  };
}

/**
 * Log a concise coverage report. Keep logs short and structured.
 */
export function logCoverageReport(report: {
  periods: Period[];
  templatePeriods: Period[];
  duplicates: Period[];
  invalidFormat: Period[];
  missing: Period[];
  unexpected: Period[];
  badRevenue: Period[];
}) {
  logger.error({
    context: "lookup.coverage",
    message: "Coverage validation report",
    stats: {
      badRevenue: report.badRevenue,
      displayCount: report.periods.length,
      duplicates: report.duplicates,
      invalidFormat: report.invalidFormat,
      missing: report.missing,
      templateCount: report.templatePeriods.length,
      unexpected: report.unexpected,
    },
  });
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
      throw new ValidationError(
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
    throw new ValidationError(
      "RevenueDisplayEntity missing 'period' and 'year/monthNumber' fields to derive Period",
    );
  }

  const normalized = normalizePeriod(`${year}-${monthNumber}`);
  if (!isValidPeriod(normalized)) {
    throw new ValidationError(
      `Invalid derived period format from year/monthNumber: ${year}/${monthNumber} -> ${normalized}`,
    );
  }

  const period = toPeriod(normalized);

  logger.debug({
    context: "derivePeriodFromDisplayEntity",
    message: "Derived period from the display entity",
    period,
  });

  return period;
}
