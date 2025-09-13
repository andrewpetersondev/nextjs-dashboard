import type { MonthName } from "@/features/revenues/constants/date";
import type { Period } from "@/shared/domain/domain-brands";
import type { Cents, Dollars } from "@/shared/money/types";

// Standardized sources of revenue data.
export const REVENUE_SOURCES = [
  "seed",
  "handler",
  "invoice_event",
  "rolling_calculation",
  "template",
] as const;

// Type-safe union of valid revenue sources.
export type RevenueSource = (typeof REVENUE_SOURCES)[number];

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
  readonly average: Cents;
  readonly maximum: Cents;
  readonly minimum: Cents;
  readonly monthsWithData: number;
  readonly total: Cents;
}
