import type { Period } from "@/shared/domain/domain-brands";
import { toPeriod } from "@/shared/domain/id-converters";
import { formatYearMonthUTC } from "@/shared/utils/date/format";

/**
 * Converts a Date to a branded Period (first-of-month Date).
 */
export function dateToPeriod(date: Date): Period {
  return toPeriod(date);
}

/**
 * Converts a branded Period to a Date (returns the branded Date value).
 */
export function periodToDate(period: Period): Date {
  return period as unknown as Date;
}

/**
 * Stable string key for a Period (yyyy-MM)
 */
export function periodKey(period: Period): string {
  const d = periodToDate(period);
  return formatYearMonthUTC(d);
}
