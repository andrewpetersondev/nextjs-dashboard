import { addMonths, format, isValid, parse } from "date-fns";
import { ValidationError } from "@/errors/errors";
import type { Period } from "@/lib/definitions/brands";

/**
 * Normalize an input into a branded Period (first-of-month Date)
 * Accepted inputs:
 * - Date: returns first day of its month
 * - string: "yyyy-MM" or "yyyy-MM-01"; normalized to first-of-month Date
 * todo: will i ever need "yyyy-MM"? can i just pass in date objects? does this actually brand by casting?
 */
export function toPeriod(input: Date | string): Period {
  if (input instanceof Date) {
    if (!isValid(input)) throw new ValidationError("Invalid Date for period");
    const normalized = new Date(
      Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), 1),
    );
    return normalized as Period;
  }

  if (typeof input === "string") {
    // Try yyyy-MM first
    let parsed = parse(input, "yyyy-MM", new Date());
    if (!isValid(parsed) || format(parsed, "yyyy-MM") !== input) {
      // Try yyyy-MM-dd (must be first day)
      parsed = parse(input, "yyyy-MM-dd", new Date());
      if (!isValid(parsed) || format(parsed, "yyyy-MM-dd") !== input) {
        throw new ValidationError(`Invalid period: "${input}"`);
      }
    }
    const normalized = new Date(
      Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), 1),
    );
    return normalized as Period;
  }

  throw new ValidationError("Unsupported period input type");
}

/**
 * Converts a Date to a branded Period (first-of-month Date).
 */
export function dateToPeriod(date: Date): Period {
  if (!isValid(date)) throw new ValidationError("Invalid Date");
  const normalized = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
  );
  return normalized as Period;
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
  return format(d, "yyyy-MM");
}
