import type { Dollars } from "@/shared/money/types";

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

// Type-safe union of valid month name abbreviations.
export type MonthName = (typeof MONTH_ORDER)[number];

// Standardized period durations used in revenue calculations.
export const INTERVAL_DURATIONS = ["year", "month"] as const;

// Type-safe union of valid interval durations.
export type IntervalDuration = (typeof INTERVAL_DURATIONS)[number];

/**
 * Data Transfer Object for simplified revenue display data.
 *
 * Represents the minimal data required for revenue visualization
 * in charts and summaries, with values converted to user-friendly formats.
 *
 * @prop month - Three-letter month abbreviation (e.g., "Jan", "Feb", "Mar")
 * @prop totalAmount - Revenue amount in dollars (converted from database cents)
 * @prop monthNumber - Sequential month number for proper chronological ordering and scrolling logic
 */
export interface SimpleRevenueDto {
  readonly month: MonthName;
  readonly totalAmount: Dollars;
  readonly monthNumber: number;
}

export const MIN_REVENUE_MONTHS = 1;
export const MAX_REVENUE_MONTHS = 12;

export const MAX_REVENUE_YEAR = 2100;
export const MIN_REVENUE_YEAR = 2000;
