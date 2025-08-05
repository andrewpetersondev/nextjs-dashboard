import type { MonthName } from "@/features/revenues/core/revenue.types";

/**
 * Data Transfer Object for simplified revenue display data.
 */
export interface SimpleRevenueDto {
  /** Three-letter month abbreviation (e.g., "Jan", "Feb", "Mar") */
  readonly month: MonthName;
  /** Revenue amount in dollars (converted from database cents) */
  readonly revenue: number;
  /** Sequential month number for proper chronological ordering and scrolling logic */
  readonly monthNumber: number;
}

/**
 * Complete chart data transfer object with revenue data and statistical metrics.
 */
export interface RevenueChartDto {
  /** Array of monthly revenue data in chronological order */
  readonly monthlyData: SimpleRevenueDto[];
  /** Aggregated statistical metrics for the dataset */
  readonly statistics: RevenueStatisticsDto;
  /** Current year for display context and chart labeling */
  readonly year: number;
}

/**
 * Statistical metrics data transfer object with dollar-converted values.
 */
export interface RevenueStatisticsDto {
  /** Highest revenue amount in dollars across all months with data */
  readonly maximum: number;
  /** Lowest revenue amount in dollars (excluding zero-revenue months) */
  readonly minimum: number;
  /** Average revenue in dollars calculated from months with data */
  readonly average: number;
  /** Total revenue in dollars across all 12 months (including zeros) */
  readonly total: number;
  /** Count of months containing actual revenue data (non-zero values) */
  readonly monthsWithData: number;
}
