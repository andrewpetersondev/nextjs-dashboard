import { format } from "date-fns";
import type { Period } from "@/shared/branding/brands";
import { toPeriod } from "@/shared/branding/converters/id-converters";

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
 * Formats a Date as yyyy-MM (UTC-based string useful for keys).
 */
export function formatYearMonthUtc(date: Date): string {
  return format(date, "yyyy-MM");
}

/**
 * Stable string key for a Period (yyyy-MM)
 */
export function periodKey(period: Period): string {
  const d = periodToDate(period);
  return formatYearMonthUtc(d);
}
