import { ValidationError } from "@/errors/errors";
import type { Period } from "@/lib/definitions/brands";

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
 *
 * @remarks
 * **Pattern Benefits: **
 * - Type-safe error handling with discriminated unions
 * - Consistent API response structure across revenue operations
 * - Eliminates a need for exception-based error handling in actions
 * - Enables exhaustive pattern matching in consuming code
 *
 * @example
 * ```typescript
 * const result: RevenueActionResult<RevenueChartDto> = await getRevenueChartAction();
 *
 * if (result.success) {
 *   // TypeScript knows result.data is RevenueChartDto
 *   console.log(result.data.statistics.total);
 * } else {
 *   // TypeScript knows result.error is string
 *   console.error(result.error);
 * }
 * ```
 */
export type RevenueActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Metadata for a single month in a 12-month rolling period.
 *
 * @prop displayOrder - Zero-based position in the 12-month chronological sequence (0-11)
 * @prop month - Three-letter month abbreviation for display purposes (e.g., "Jan", "Feb")
 * @prop monthNumber - Calendar month number (1-12) for date calculations
 * @prop year - Four-digit year for the month (e.g., 2023)
 * @prop period - Branded period (YYYY-MM) for this month, used as the source of truth
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
  yAxisLabels: string[];
  topLabel: Dollars;
}

/**
 * Safely convert a calendar month number (1-12) to a MonthName.
 * Throws a ValidationError if the input is out of range.
 */
export function getMonthName(monthNumber: number): MonthName {
  // convert to 0-based index
  const index = monthNumber - 1;
  const name = MONTH_ORDER[index];
  if (!name) {
    throw new ValidationError(
      `Invalid month number: ${monthNumber}. Expected a value between 1 and 12.`,
    );
  }
  return name;
}

/**
 * Runtime validator to narrow arbitrary strings to RevenueSource.
 * Throws ValidationError if the value is not in the allowed list.
 */
export function toRevenueSource(value: string): RevenueSource {
  if ((REVENUE_SOURCES as readonly string[]).includes(value)) {
    return value as RevenueSource;
  }
  throw new ValidationError(
    `Invalid RevenueSource: "${value}". Allowed values: ${REVENUE_SOURCES.join(", ")}`,
  );
}
