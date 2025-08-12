import type {
  Dollars,
  MonthName,
} from "@/features/revenues/core/revenue.types";

/**
 * Data Transfer Object for simplified revenue display data.
 *
 * @prop month - Three-letter month abbreviation (e.g., "Jan", "Feb", "Mar")
 * @prop revenue - Revenue amount in dollars (converted from database cents)
 * @prop monthNumber - Sequential month number for proper chronological ordering and scrolling logic
 */
export interface SimpleRevenueDto {
  readonly month: MonthName;
  readonly revenue: Dollars;
  readonly monthNumber: number;
}

/**
 * Complete chart data transfer object with revenue data and statistical metrics.
 *
 * @prop monthlyData - Array of monthly revenue data in chronological order
 * @prop statistics - Aggregated statistical metrics for the dataset
 * @prop year - Current year for display context and chart labeling
 */
export interface RevenueChartDto {
  readonly monthlyData: SimpleRevenueDto[];
  readonly statistics: RevenueStatisticsDto;
  readonly year: number;
}

/**
 * Statistical metrics data transfer object with dollar-converted values.
 *
 * @prop maximum - Highest revenue amount in dollars across all months with data
 * @prop minimum - Lowest revenue amount in dollars (excluding zero-revenue months)
 * @prop average - Average revenue in dollars calculated from months with data
 * @prop total - Total revenue in dollars across all 12 months (including zeros)
 * @prop monthsWithData - Count of months containing actual revenue data (non-zero values)
 */
export interface RevenueStatisticsDto {
  readonly maximum: Dollars;
  readonly minimum: Dollars;
  readonly average: Dollars;
  readonly total: Dollars;
  readonly monthsWithData: number;
}
