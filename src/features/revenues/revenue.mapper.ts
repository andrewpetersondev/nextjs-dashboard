import "server-only";

import type { RevenueEntity } from "@/db/models/revenue.entity";
import type { RevenueRow } from "@/db/schema";
import { ValidationError } from "@/errors/errors";
import { toRevenueId } from "@/lib/definitions/brands";

/**
 * Maps a raw revenue row from the database to a RevenueEntity object.
 *
 * @param row - Raw revenue row from the database
 * @returns RevenueEntity object
 * @throws ValidationError if input is not a valid row
 */
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

/**
 * Maps an array of raw revenue rows to an array of RevenueEntity objects.
 *
 * @param rows - Array of raw revenue rows from the database
 * @returns Array of RevenueEntity objects
 * @throws ValidationError if input is not a valid array
 */
export function mapRevenueRowsToEntities(rows: RevenueRow[]): RevenueEntity[] {
  if (!Array.isArray(rows)) {
    throw new ValidationError("Invalid revenue rows data");
  }
  return rows.map((row) => rawDbToRevenueEntity(row));
}
