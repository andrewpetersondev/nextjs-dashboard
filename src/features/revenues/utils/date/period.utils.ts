import { addMonths, format } from "date-fns";
import { type Period, toPeriod } from "@/lib/definitions/brands";
import { formatYearMonth } from "@/lib/utils/date.utils";

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
 * Formats a branded Period for display (e.g., "August 2024").
 */
export function formatPeriod(period: Period): string {
  const d = periodToDate(period);
  return format(d, "MMMM yyyy");
}

/**
 * Adds months to a Period and returns another Period (first-of-month Date)
 */
export function addMonthsToPeriod(period: Period, months: number): Period {
  const d = periodToDate(period);
  const result = addMonths(d, months);
  return dateToPeriod(result);
}

/**
 * Extracts the month number from a Period value.
 * @returns The month number (1-12)
 */
export function extractMonthNumberFromPeriod(period: Period): number {
  const d = periodToDate(period);
  return d.getUTCMonth() + 1;
}

/**
 * Stable string key for a Period (yyyy-MM)
 */
export function periodKey(period: Period): string {
  const d = periodToDate(period);
  return formatYearMonth(d);
}
