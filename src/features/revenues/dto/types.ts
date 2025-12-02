import type { MonthName } from "@/features/revenues/constants/date";
import type { Dollars } from "@/shared/utilities/money/types";

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
