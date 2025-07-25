import "server-only";

import type { RevenueId } from "@/lib/definitions/brands";

/**
 * Represents a revenue entity in the database, defining the structure and properties of a revenue record.
 * Updated to remove unused sensitiveData field and align with invoice-calculated revenue.
 */
export interface RevenueEntity {
  readonly id: RevenueId;
  readonly month: string;
  readonly revenue: number;
  readonly calculatedFromInvoices: number;
  readonly invoiceCount: number;
  readonly isCalculated: boolean;
  readonly calculationSource: string;
  readonly calculationDate: Date | null; // timestamp - correct
  readonly year: number; // 2023, 2024, etc. - should be number // seed gives it a crazy value like 9999 or -1000344
  readonly startDate: string; // date - should be string 'YYYY-MM-DD'
  readonly endDate: string; // date - should be string 'YYYY-MM-DD'
  readonly createdAt: Date; // timestamp - correct
  readonly updatedAt: Date; // timestamp - correct
}
