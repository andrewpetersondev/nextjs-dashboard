import type { MonthName } from "@/features/revenues/domain/constants";
import type { Period } from "@/shared/branding/brands";
import type { Cents, Dollars } from "@/shared/utilities/money/types";

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
export interface YaxisResult {
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

/**
 * Statistical metrics data transfer object with dollar-converted values.
 */
export interface RevenueStatisticsDto {
  readonly average: Dollars;
  readonly maximum: Dollars;
  readonly minimum: Dollars;
  readonly monthsWithData: number;
  readonly total: Dollars;
}

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
  readonly totalPaidAmount: Dollars;
  readonly totalPendingAmount: Dollars;
  readonly monthNumber: number;
}

/**
 * Complete chart data transfer object with revenue data and statistical metrics.
 */
export interface RevenueChartDto {
  readonly monthlyData: readonly SimpleRevenueDto[];
  readonly statistics: RevenueStatisticsDto;
  readonly year: number;
}
