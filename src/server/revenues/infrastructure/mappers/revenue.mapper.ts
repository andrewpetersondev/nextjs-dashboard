import "server-only";
import { isValid } from "date-fns";
import type { RevenueRow } from "@/server/db/schema/revenues";
import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import { validateCondition } from "@/server/revenues/infrastructure/mappers/assert.condition";
import {
  isNonNegativeInteger,
  isNonNegativeNumber,
} from "@/server/revenues/infrastructure/mappers/number";
import { toRevenueSource } from "@/server/revenues/infrastructure/mappers/revenue-source.mapper";
import {
  toPeriod,
  toRevenueId,
} from "@/shared/branding/converters/id-converters";
import { AppError } from "@/shared/infrastructure/errors/core/app-error.class";

/**
 * Maps a raw revenue row from the database to a RevenueEntity object.
 *
 * @param revenueRow - Raw revenue data from the database
 * @returns Validated RevenueEntity
 * @throws {AppError} When row data is invalid or missing required fields
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
    isValid(revenueRow.createdAt),
    "Invalid revenue row: 'createdAt' must be a Date",
  );
  validateCondition(
    isValid(revenueRow.updatedAt),
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
    throw new AppError("validation", {
      message: "Invalid revenue row data: expected non-null object",
    });
  }
  try {
    validateRevenueRow(revenueRow);

    const sourceResult = toRevenueSource(revenueRow.calculationSource);
    const calculationSource: RevenueEntity["calculationSource"] =
      typeof sourceResult === "object" && "ok" in sourceResult
        ? sourceResult.ok
          ? sourceResult.value
          : (() => {
              throw new AppError("validation", {
                message: `Invalid calculationSource: ${sourceResult.error.message}`,
              });
            })()
        : sourceResult;

    return {
      calculationSource,
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
    throw new AppError("validation", {
      message: `Failed to map revenue row to entity: ${error instanceof Error ? error.message : "Unknown error"}`,
    });
  }
}

/**
 * Maps an array of raw revenue rows to an array of RevenueEntity objects.
 *
 * @param revenueRows - Array of raw revenue data from the database
 * @returns Array of validated RevenueEntity objects
 * @throws {AppError} When rows is not an array or contains invalid data
 */
export function mapRevenueRowsToEntities(
  revenueRows: RevenueRow[],
): RevenueEntity[] {
  if (!Array.isArray(revenueRows)) {
    throw new AppError("validation", {
      message: "Invalid revenue rows data: expected array",
    });
  }
  return revenueRows.map((revenueRow, index) => {
    try {
      return mapRevenueRowToEntity(revenueRow);
    } catch (error) {
      throw new AppError("validation", {
        message: `Failed to map revenue row at index ${index}: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  });
}
