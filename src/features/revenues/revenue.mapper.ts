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
    calculationSource: row.calculationSource,
    createdAt: row.createdAt,
    id: toRevenueId(row.id), // pretty sure it is stored as a branded type in the database
    invoiceCount: row.invoiceCount,
    period: row.period, // Assuming period is a string like '2024-01'
    revenue: row.revenue,
    updatedAt: row.updatedAt,
  };
}
