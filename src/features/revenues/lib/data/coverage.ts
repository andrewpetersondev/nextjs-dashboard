import type { RevenueDisplayRow } from "@/features/revenues/core/types";
import { computeTemplatePeriods } from "@/features/revenues/lib/data/lookup";
import type { Period } from "@/shared/brands/domain-brands";
import { isPeriod } from "@/shared/brands/guards";
import { toPeriod } from "@/shared/brands/mappers";

/**
 * Build a diagnostics report comparing actual data vs template periods.
 * Useful before/around merges to pinpoint missing/unexpected periods.
 */
export function makeCoverageReport<
  T extends { year: number } & ({ monthNumber: number } | { month: number }),
>(actualData: RevenueDisplayRow[], template: T[]) {
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
