import "server-only";
import type { RevenueRow } from "@/server/db/schema/revenues";
import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import { toRevenueSource } from "@/server/revenues/infrastructure/validation/validator";
import { ValidationError } from "@/shared/core/errors/base-error.subclasses";
import { validateCondition } from "@/shared/core/validation/primitives/assert.condition";
import {
  isNonNegativeInteger,
  isNonNegativeNumber,
} from "@/shared/core/validation/primitives/number";
import { toPeriod, toRevenueId } from "@/shared/domain/id-converters";

import { isDateValid } from "@/shared/utils/date/guards";

/**
 * Maps a raw revenue row from the database to a RevenueEntity object.
 *
 * @param revenueRow - Raw revenue data from the database
 * @returns Validated RevenueEntity
 * @throws {ValidationError} When row data is invalid or missing required fields
 */
function validateRevenueRow(revenueRow: RevenueRow): void {
  validateCondition(
    revenueRow.id,
    "Invalid revenue row: missing required field 'id'",
  );
  validateCondition(
    revenueRow.period,
    "Invalid revenue row: missing required field 'period'",
  );
  validateCondition(
    revenueRow.calculationSource,
    "Invalid revenue row: missing required field 'calculationSource'",
  );
  validateCondition(
    isDateValid(revenueRow.createdAt),
    "Invalid revenue row: 'createdAt' must be a Date",
  );
  validateCondition(
    isDateValid(revenueRow.updatedAt),
    "Invalid revenue row: 'updatedAt' must be a Date",
  );
  validateCondition(
    isNonNegativeInteger(revenueRow.invoiceCount),
    "Invalid revenue row: 'invoiceCount' must be a non-negative integer",
  );
  validateCondition(
    isNonNegativeNumber(revenueRow.totalAmount),
    "Invalid revenue row: 'totalAmount' must be a non-negative number",
  );
  validateCondition(
    isNonNegativeNumber(revenueRow.totalPaidAmount as number),
    "Invalid revenue row: 'totalPaidAmount' must be a non-negative number",
  );
  validateCondition(
    isNonNegativeNumber(revenueRow.totalPendingAmount as number),
    "Invalid revenue row: 'totalPendingAmount' must be a non-negative number",
  );
}

export function mapRevenueRowToEntity(revenueRow: RevenueRow): RevenueEntity {
  if (!revenueRow || typeof revenueRow !== "object") {
    throw new ValidationError(
      "Invalid revenue row data: expected non-null object",
    );
  }
  try {
    validateRevenueRow(revenueRow);
    return {
      calculationSource: toRevenueSource(revenueRow.calculationSource),
      createdAt: revenueRow.createdAt,
      id: toRevenueId(revenueRow.id),
      invoiceCount: revenueRow.invoiceCount,
      period: toPeriod(revenueRow.period),
      totalAmount: revenueRow.totalAmount,
      totalPaidAmount: revenueRow.totalPaidAmount as number,
      totalPendingAmount: revenueRow.totalPendingAmount as number,
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
