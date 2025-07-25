import "server-only";

import {
  GetRevenueSchema,
  MONTH_ORDER,
  type MonthName,
  type RevenueQueryInput,
} from "@/features/revenues/revenue.types";

/**
 * Sort revenue data by month order (Jan, Feb, Mar, etc.)
 * Uses the MONTH_ORDER constant for consistent sorting across the application
 */
export function sortRevenueByMonth<T extends { month: string }>(
  data: T[],
): T[] {
  return data.sort(
    (a, b) =>
      MONTH_ORDER.indexOf(a.month as MonthName) -
      MONTH_ORDER.indexOf(b.month as MonthName),
  );
}

/**
 * Get current year as default fallback
 * Provides a consistent way to get the current year across revenue operations
 */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * Validate and parse revenue input with year defaulting
 * Centralizes input validation and year defaulting logic
 *
 * @param input - Revenue query input to validate
 * @returns Validated input with year defaulted to current year if not provided
 */
export function validateRevenueInput(input: RevenueQueryInput): {
  year: number;
} {
  const validatedInput = GetRevenueSchema.parse(input);
  const year = validatedInput.year ?? getCurrentYear();
  return { year };
}
