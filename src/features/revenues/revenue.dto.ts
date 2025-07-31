import "server-only";

/**
 * Data Transfer Object for revenue data exposed to clients.
 * Excludes sensitive fields from the entity while providing essential revenue information.
 */
export interface RevenueDto {
  readonly month: string;
  readonly revenue: number;
  readonly year: number;
  readonly invoiceCount: number;
  readonly isCalculated: boolean;
  readonly calculationSource: string;
  readonly calculationDate?: string;
}

/**
 * Simplified revenue DTO containing only core display data.
 * Used for dashboard charts and basic revenue visualization.
 */
export interface SimpleRevenueDto {
  readonly month: string;
  readonly revenue: number; // Converted to dollars
  readonly monthNumber: number; // For proper ordering/scrolling
}

/**
 * Chart-specific DTO with converted values and statistics
 */
export interface RevenueChartDto {
  readonly monthlyData: SimpleRevenueDto[];
  readonly statistics: RevenueStatisticsDto;
  readonly year: number;
}

/**
 * Statistics DTO with converted dollar values
 */
export interface RevenueStatisticsDto {
  readonly maximum: number; // Dollars
  readonly minimum: number; // Dollars
  readonly average: number; // Dollars
  readonly total: number; // Dollars
  readonly monthsWithData: number;
}
