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
  readonly revenue: number;
}

/**
 * Request DTO for revenue calculations with date range filtering.
 * Supports flexible revenue calculation parameters.
 */
export interface RevenueCalculationDto {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly customerId?: string;
  readonly recalculate?: boolean;
  readonly year?: number;
}

/**
 * Response DTO for revenue calculation operations.
 * Provides metadata about the calculation process and results.
 */
export interface RevenueCalculationResponseDto {
  readonly revenues: RevenueDto[];
  readonly totalRevenue: number;
  readonly totalInvoices: number;
  readonly calculationDate: string;
  readonly calculationSource: string;
  readonly periodStart: string;
  readonly periodEnd: string;
}

/**
 * Request DTO for updating revenue records.
 * Allows partial updates to revenue data with validation metadata.
 */
export interface UpdateRevenueDto {
  readonly month: string;
  readonly revenue?: number;
  readonly calculatedFromInvoices?: number;
  readonly invoiceCount?: number;
  readonly calculationSource?: string;
  readonly year?: number;
}
