import type { Dollars } from "@/shared/money/types";
import type { SimpleRevenueDto } from "@/shared/revenues/types";

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
 * Complete chart data transfer object with revenue data and statistical metrics.
 */
export interface RevenueChartDto {
  readonly monthlyData: readonly SimpleRevenueDto[];
  readonly statistics: RevenueStatisticsDto;
  readonly year: number;
}
