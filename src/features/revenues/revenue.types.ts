import * as z from "zod";

export const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
export type MonthName = (typeof MONTH_ORDER)[number];

export const DEFAULT_YEAR_RANGE = {
  MAX: 2100,
  MIN: 2000,
} as const;

/**
 * Validation schema for revenue queries with optional year parameter
 */
export const GetRevenueSchema = z.object({
  year: z
    .number()
    .int()
    .min(DEFAULT_YEAR_RANGE.MIN)
    .max(DEFAULT_YEAR_RANGE.MAX)
    .optional(),
});

/**
 * Validation schema for revenue recalculation with required year parameter
 */
export const RecalculateRevenueSchema = z.object({
  year: z
    .number()
    .int()
    .min(DEFAULT_YEAR_RANGE.MIN)
    .max(DEFAULT_YEAR_RANGE.MAX),
});

export type RevenueQueryInput = z.infer<typeof GetRevenueSchema>;

export type RevenueRecalculationInput = z.infer<
  typeof RecalculateRevenueSchema
>;

/**
 * Standard action result type for revenue operations
 * Provides consistent success/error response structure
 */
export type RevenueActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
