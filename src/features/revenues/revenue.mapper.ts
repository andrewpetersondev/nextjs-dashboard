import "server-only";

import type { RevenueEntity } from "@/db/models/revenue.entity";
import type { RevenueRow } from "@/db/schema";
import { ValidationError } from "@/errors/errors";
import { toRevenueId } from "@/lib/definitions/brands";

export function rawDbToRevenueEntity(row: RevenueRow): RevenueEntity {
  if (!row || typeof row !== "object") {
    throw new ValidationError("Invalid revenue row data");
  }
  return {
    calculatedFromInvoices: row.calculatedFromInvoices,
    calculationDate: row.calculationDate ? new Date(row.calculationDate) : null,
    calculationSource: row.calculationSource,
    createdAt: new Date(row.createdAt),
    endDate: row.endDate, // Assuming this is already in 'YYYY-MM-DD' format
    id: toRevenueId(row.id),
    invoiceCount: row.invoiceCount,
    isCalculated: row.isCalculated,
    month: row.month,
    revenue: row.revenue,
    startDate: row.startDate, // Assuming this is already in 'YYYY-MM-DD' format
    updatedAt: new Date(row.updatedAt),
    year: row.year,
  };
}
