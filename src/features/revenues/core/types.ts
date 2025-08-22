import type { Period } from "@/shared/brands/domain-brands";

/**
 * Money unit aliases to make dollars vs cents explicit at type level.
 * These are plain number aliases (non-branded) to keep the refactor minimal
 * while still documenting intent throughout the codebase.
 */
export type Cents = number;
export type Dollars = number;

/**
 * An ordered array of three-letter month abbreviations.
 */
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

/**
 * Type-safe union of valid month name abbreviations.
 */
export type MonthName = (typeof MONTH_ORDER)[number];

/**
 * Standardized period durations used in revenue calculations.
 */
export const INTERVAL_DURATIONS = ["year", "month"] as const;

/**
 * Type-safe union of valid interval durations.
 */
export type IntervalDuration = (typeof INTERVAL_DURATIONS)[number];

/**
 * Standardized sources of revenue data.
 */
export const REVENUE_SOURCES = [
  "seed",
  "handler",
  "invoice_event",
  "rolling_calculation",
  "template",
] as const;

/**
 * Type-safe union of valid revenue sources.
 */
export type RevenueSource = (typeof REVENUE_SOURCES)[number];

/**
 * Standard discriminated union type for revenue operation results.
 *
 * Provides a consistent success / error response structure across all revenue
 * actions and services. Enables type-safe error handling and result processing.
 *
 * @template T - The type of data returned on successful operations
 */
export type RevenueActionResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: string };

/**
 * Metadata for a single month in a 12-month rolling period.
 *
 * @prop displayOrder - Zero-based position in the 12-month chronological sequence (0-11)
 * @prop month - Three-letter month abbreviation for display purposes (e.g., "Jan", "Feb")
 * @prop monthNumber - Calendar month number (1-12) for date calculations
 * @prop year - Four-digit year for the month (e.g., 2023)
 * @prop period - Branded Period (first-of-month Date) for this month, used as the source of truth
 */
export interface RollingMonthData {
  readonly displayOrder: number;
  readonly month: MonthName;
  readonly monthNumber: number;
  readonly year: number;
  readonly period: Period;
}

/**
 * Calculated statistical metrics from revenue data.
 *
 * @prop maximum - Highest revenue amount in cents across months with data
 * @prop minimum - Lowest revenue amount in cents (excluding zero-revenue months)
 * @prop average - Average revenue in cents calculated from months with data
 * @prop total - Total revenue in cents across all 12 months (including zeros)
 * @prop monthsWithData - Count of months containing actual revenue data (non-zero values)
 */
export interface RevenueStatistics {
  readonly maximum: Cents;
  readonly minimum: Cents;
  readonly average: Cents;
  readonly total: Cents;
  readonly monthsWithData: number;
}

/**
 * Chart axis data for revenue charts.
 * @prop yAxisLabels - Array of formatted Y-axis labels in ascending order
 * @prop topLabel - Maximum chart value in dollars for scaling purposes
 */
export interface YAxisResult {
  readonly yAxisLabels: readonly string[];
  readonly topLabel: Dollars;
}

/**
 * Create a success result for RevenueActionResult.
 */
export function createSuccessResult<T>(data: T): RevenueActionResult<T> {
  return { data, success: true } as const;
}

/**
 * Create an error result for RevenueActionResult.
 */
export function createErrorResult<T>(error: string): RevenueActionResult<T> {
  return { error, success: false } as const;
}
