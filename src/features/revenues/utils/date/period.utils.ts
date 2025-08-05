import { format, isValid, parse } from "date-fns";
import { ValidationError } from "@/errors/errors";
import type { Period } from "@/lib/definitions/brands";

/**
 * Validates and brands a period string (YYYY-MM).
 * Throws a ValidationError if invalid.
 */
export function toPeriod(period: string): Period {
  // Parse with strict mask, e.g. "2024-08" -> Date object (1st of month)
  const parsed = parse(period, "yyyy-MM", new Date());
  if (!isValid(parsed) || format(parsed, "yyyy-MM") !== period) {
    throw new ValidationError(`Invalid period: "${period}"`);
  }
  return period as Period;
}

/**
 * Converts a Date to a branded Period (YYYY-MM).
 */
export function dateToPeriod(date: Date): Period {
  return format(date, "yyyy-MM") as Period;
}

/**
 * Parses a Period to a Date (1st day of that month).
 */
export function periodToDate(period: Period): Date {
  // Always valid if constructed via toPeriod
  return parse(period, "yyyy-MM", new Date());
}

/**
 * Formats a branded Period for display (e.g., "August 2024").
 */
export function formatPeriod(period: Period): string {
  return format(periodToDate(period), "MMMM yyyy");
}
