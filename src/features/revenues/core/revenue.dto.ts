import type {
  Dollars,
  MonthName,
} from "@/features/revenues/core/revenue.types";

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

/**
 * Complete chart data transfer object with revenue data and statistical metrics.
 *
 * Encapsulates all data required for rendering comprehensive revenue charts
 * with context and statistical analysis.
 *
 * @prop monthlyData - Array of monthly revenue data in chronological order
 * @prop statistics - Aggregated statistical metrics for the dataset
 * @prop year - Current year for display context and chart labeling
 */
export interface RevenueChartDto {
  readonly monthlyData: readonly SimpleRevenueDto[];
  readonly statistics: RevenueStatisticsDto;
  readonly year: number;
}

/**
 * Statistical metrics data transfer object with dollar-converted values.
 *
 * Provides comprehensive statistical analysis of revenue data with
 * all monetary values converted to user-friendly dollar amounts.
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

/**
 * Type guard to validate SimpleRevenueDto structure.
 *
 * @param value - The value to check
 * @returns True if the value is a valid SimpleRevenueDto
 */
export function isSimpleRevenueDto(value: unknown): value is SimpleRevenueDto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const dto = value as Record<string, unknown>;

  return (
    typeof dto.month === "string" &&
    typeof dto.totalAmount === "number" &&
    typeof dto.monthNumber === "number" &&
    dto.monthNumber >= 1 &&
    dto.monthNumber <= 12
  );
}

/**
 * Type guard to validate RevenueStatisticsDto structure.
 *
 * @param value - The value to check
 * @returns True if the value is a valid RevenueStatisticsDto
 */
export function isRevenueStatisticsDto(
  value: unknown,
): value is RevenueStatisticsDto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const dto = value as Record<string, unknown>;

  return (
    typeof dto.maximum === "number" &&
    typeof dto.minimum === "number" &&
    typeof dto.average === "number" &&
    typeof dto.total === "number" &&
    typeof dto.monthsWithData === "number" &&
    dto.monthsWithData >= 0
  );
}

/**
 * Type guard to validate RevenueChartDto structure.
 *
 * @param value - The value to check
 * @returns True if the value is a valid RevenueChartDto
 */
export function isRevenueChartDto(value: unknown): value is RevenueChartDto {
  if (!value || typeof value !== "object") {
    return false;
  }

  const dto = value as Record<string, unknown>;

  return (
    Array.isArray(dto.monthlyData) &&
    dto.monthlyData.every(isSimpleRevenueDto) &&
    isRevenueStatisticsDto(dto.statistics) &&
    typeof dto.year === "number"
  );
}
