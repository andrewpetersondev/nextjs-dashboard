/**
 * Mapper functions for converting between database rows and domain entities.
 *
 * This file contains utility functions for mapping between database representation
 * and domain model representation of revenue entities.
 */

import "server-only";

import type { RevenueRow } from "@/db/schema";
import { ValidationError } from "@/errors/errors";
import type { RevenueEntity } from "@/features/revenues/core/revenue.entity";

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
    id: row.id, // Already RevenueId
    invoiceCount: row.invoiceCount,
    period: row.period, // Already Period ('2024-01')
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
