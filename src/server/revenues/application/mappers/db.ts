import "server-only";

import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import { toRevenueSource } from "@/server/revenues/infrastructure/validation/validator";
import { toPeriod, toRevenueId } from "@/shared/brands/mappers";
import { ValidationError } from "@/shared/errors/domain";
import { isValidDate } from "@/shared/utils/date";
import { ensure } from "@/shared/validation/ensure";
import {
  isNonNegativeInteger,
  isNonNegativeNumber,
} from "@/shared/validation/number";
import type { RevenueRow } from "../../../../../node-only/schema/revenues";

/**
 * Maps a raw revenue row from the database to a RevenueEntity object.
 *
 * @param revenueRow - Raw revenue data from the database
 * @returns Validated RevenueEntity
 * @throws {ValidationError} When row data is invalid or missing required fields
 */
export function mapRevenueRowToEntity(revenueRow: RevenueRow): RevenueEntity {
  if (!revenueRow || typeof revenueRow !== "object") {
    throw new ValidationError(
      "Invalid revenue row data: expected non-null object",
    );
  }
  // Validate required fields presence and shapes early for clearer errors
  ensure(revenueRow.id, "Invalid revenue row: missing required field 'id'");
  ensure(
    revenueRow.period,
    "Invalid revenue row: missing required field 'period'",
  );
  ensure(
    revenueRow.calculationSource,
    "Invalid revenue row: missing required field 'calculationSource'",
  );
  ensure(
    isValidDate(revenueRow.createdAt),
    "Invalid revenue row: 'createdAt' must be a Date",
  );
  ensure(
    isValidDate(revenueRow.updatedAt),
    "Invalid revenue row: 'updatedAt' must be a Date",
  );
  ensure(
    isNonNegativeInteger(revenueRow.invoiceCount),
    "Invalid revenue row: 'invoiceCount' must be a non-negative integer",
  );
  ensure(
    isNonNegativeNumber(revenueRow.totalAmount),
    "Invalid revenue row: 'totalAmount' must be a non-negative number",
  );
  try {
    return {
      calculationSource: toRevenueSource(revenueRow.calculationSource),
      createdAt: revenueRow.createdAt,
      id: toRevenueId(revenueRow.id),
      invoiceCount: revenueRow.invoiceCount,
      period: toPeriod(revenueRow.period),
      totalAmount: revenueRow.totalAmount,
      updatedAt: revenueRow.updatedAt,
    };
  } catch (error) {
    throw new ValidationError(
      `Failed to map revenue row to entity: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Maps an array of raw revenue rows to an array of RevenueEntity objects.
 *
 * @param revenueRows - Array of raw revenue data from the database
 * @returns Array of validated RevenueEntity objects
 * @throws {ValidationError} When rows is not an array or contains invalid data
 */
export function mapRevenueRowsToEntities(
  revenueRows: RevenueRow[],
): RevenueEntity[] {
  if (!Array.isArray(revenueRows)) {
    throw new ValidationError("Invalid revenue rows data: expected array");
  }
  return revenueRows.map((revenueRow, index) => {
    try {
      return mapRevenueRowToEntity(revenueRow);
    } catch (error) {
      throw new ValidationError(
        `Failed to map revenue row at index ${index}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  });
}
