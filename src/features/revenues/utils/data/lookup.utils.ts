import "server-only";

import type { RevenueDisplayEntity } from "@/features/revenues/core/revenue.entity";
import { periodKey } from "@/features/revenues/utils/date/period.utils";
import { isPeriod, type Period, toPeriod } from "@/lib/definitions/brands";
import { logger } from "@/lib/logging/logger";

const normalizePeriod = (p: string): string => {
  const [y, m] = p.split("-");
  const mm = String(Number(m)).padStart(2, "0");
  return `${y}-${mm}`;
};

/**
 * Normalize any acceptable input into a branded Period (first-of-month DATE).
 * Accepts:
 * - string like "2025-7", "2025-07", or a full date like "2025-07-15" (normalized to first day)
 * - { year, month } object (month can be 1-12 or zero-padded)
 * TODO: simplify this function to only accept full date like "2025-07-15" (normalized to first day)
 */
export function normalizeToPeriod(
  input: string | { year: number; month?: number; monthNumber?: number },
): Period {
  if (typeof input === "string") {
    const normalized = normalizePeriod(input);
    return toPeriod(normalized);
  }

  const { year } = input;
  const monthValue =
    (input as { monthNumber?: number }).monthNumber ??
    (input as { month?: number }).month;
  const normalized = normalizePeriod(`${year}-${monthValue}`);
  return toPeriod(normalized);
}

/**
 * Creates an efficient lookup map for revenue data indexed by Period month-key.
 *
 * - Normalizes all period keys to a stable "yyyy-MM" key (first-of-month semantics).
 * - Logs duplicate keys (later item overwrites earlier one).
 * - Avoids logging the entire map to keep logs concise.
 * TODO: would it make sense to simplify the function to use "yyyy-MM-dd"
 */
export function createDataLookupMap(
  actualData: RevenueDisplayEntity[],
): Map<string, RevenueDisplayEntity> {
  const dataMap = new Map<string, RevenueDisplayEntity>();
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
    keysSample: Array.from(dataMap.keys()).slice(0, 6),
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
  const periods: Period[] = actualData.map((d) => toPeriod(d.period));
  const templatePeriods: Period[] = computeTemplatePeriods(template);

  const duplicates: Period[] = [
    ...new Set(periods.filter((p, i) => periods.indexOf(p) !== i)),
  ];
  const invalidFormat = periods.filter((p) => !isPeriod(p));
  const missing = templatePeriods.filter((p) => !periods.includes(p));
  const unexpected = periods.filter((p) => !templatePeriods.includes(p));
  const badRevenue = actualData
    .filter((d) => Number.isNaN(d.totalAmount))
    .map((d) => toPeriod(d.period));

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
