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
