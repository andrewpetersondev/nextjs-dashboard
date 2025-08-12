import { ValidationError } from "@/errors/errors";
import type { Period } from "@/lib/definitions/brands";

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
export type IntervalDuration = (typeof INTERVAL_DURATIONS)[number];

export const REVENUE_SOURCES = [
  "seed",
  "handler",
  "invoice_event",
  "rolling_calculation",
  "template",
] as const;
export type RevenueSource = (typeof REVENUE_SOURCES)[number];

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

/**
 * Standard discriminated union type for revenue operation results.
 *
 * Provides consistent success/error response structure across all revenue
 * actions and services. Enables type-safe error handling and result processing.
 *
 * @template T - The type of data returned on successful operations
 *
 * @remarks
 * **Pattern Benefits:**
 * - Type-safe error handling with discriminated unions
 * - Consistent API response structure across revenue operations
 * - Eliminates need for exception-based error handling in actions
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
 */
export interface RollingMonthData {
  /** Zero-based position in the 12-month chronological sequence (0-11) */
  readonly displayOrder: number;
  /** Three-letter month abbreviation for display purposes */
  readonly month: MonthName;
  /** Calendar month number (1-12) for date calculations */
  readonly monthNumber: number;
  /** Four-digit year for the month */
  readonly year: number;
  /** Branded period (YYYY-MM) for this month (source of truth) */
  readonly period: Period;
}

/**
 * Calculated statistical metrics from revenue data.
 */
export interface RevenueStatistics {
  /** Highest revenue amount in cents across months with data */
  readonly maximum: number;
  /** Lowest revenue amount in cents (excluding zero-revenue months) */
  readonly minimum: number;
  /** Average revenue in cents calculated from months with data */
  readonly average: number;
  /** Total revenue in cents across all 12 months (including zeros) */
  readonly total: number;
  /** Count of months containing actual revenue data (non-zero values) */
  readonly monthsWithData: number;
}

/**
 * Chart axis data for revenue charts.
 */
export interface YAxisResult {
  /** Array of formatted Y-axis labels in ascending order */
  yAxisLabels: string[];
  /** Maximum chart value in dollars for scaling purposes */
  topLabel: number;
}
