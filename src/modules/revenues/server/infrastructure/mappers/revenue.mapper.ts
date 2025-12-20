import "server-only";
import { isValid } from "date-fns";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import { toRevenueSource } from "@/modules/revenues/server/infrastructure/mappers/revenue-source.mapper";
import {
  isNonNegativeInteger,
  isNonNegativeNumber,
  validateCondition,
} from "@/modules/revenues/server/infrastructure/utils/validation";
import type { RevenueRow } from "@/server/db/schema/revenues";
import {
  toPeriod,
  toRevenueId,
} from "@/shared/branding/converters/id-converters";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";

/**
 * Validates a revenue row from the database.
 * @param revenueRow - The revenue row to validate.
 * @throws Error if validation fails.
 */
function validateRevenueRow(revenueRow: RevenueRow): void {
  validateCondition(
    revenueRow.calculationSource,
    "Invalid revenue row: missing required field 'calculationSource'",
  );
  validateCondition(
    isValid(revenueRow.createdAt),
    "Invalid revenue row: 'createdAt' must be a Date",
  );
  validateCondition(
    revenueRow.id,
    "Invalid revenue row: missing required field 'id'",
  );
  validateCondition(
    isNonNegativeInteger(revenueRow.invoiceCount),
    "Invalid revenue row: 'invoiceCount' must be a non-negative integer",
  );
  validateCondition(
    revenueRow.period,
    "Invalid revenue row: missing required field 'period'",
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
  validateCondition(
    isValid(revenueRow.updatedAt),
    "Invalid revenue row: 'updatedAt' must be a Date",
  );
}

/**
 * Maps a revenue row to a revenue entity.
 * @param revenueRow - The revenue row.
 * @returns The revenue entity.
 * @throws Error if mapping fails.
 */
export function mapRevenueRowToEntity(revenueRow: RevenueRow): RevenueEntity {
  if (!revenueRow || typeof revenueRow !== "object") {
    throw makeValidationError({
      cause: "",
      message: "Invalid revenue row data: expected non-null object",
      metadata: { revenueRow },
    });
  }
  try {
    validateRevenueRow(revenueRow);

    const sourceResult = toRevenueSource(revenueRow.calculationSource);
    const calculationSource: RevenueEntity["calculationSource"] =
      typeof sourceResult === "object" && "ok" in sourceResult
        ? // biome-ignore lint/style/noNestedTernary: <ignore for now>
          sourceResult.ok
          ? sourceResult.value
          : (() => {
              throw makeValidationError({
                cause: "",
                message: `Invalid calculationSource: ${sourceResult.error.message}`,
                metadata: { revenueRow },
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
    throw makeValidationError({
      cause: "",
      message: `Failed to map revenue row to entity: ${error instanceof Error ? error.message : "Unknown error"}`,
      metadata: { revenueRow },
    });
  }
}

/**
 * Maps revenue rows to revenue entities.
 * @param revenueRows - The revenue rows.
 * @returns Array of revenue entities.
 * @throws Error if mapping fails.
 */
export function mapRevenueRowsToEntities(
  revenueRows: RevenueRow[],
): RevenueEntity[] {
  if (!Array.isArray(revenueRows)) {
    throw makeValidationError({
      cause: "",
      message: "Invalid revenue rows data: expected array",
      metadata: { revenueRows },
    });
  }
  return revenueRows.map((revenueRow, index) => {
    try {
      return mapRevenueRowToEntity(revenueRow);
    } catch (error) {
      throw makeValidationError({
        cause: "",
        message: `Failed to map revenue row at index ${index}: ${error instanceof Error ? error.message : "Unknown error"}`,
        metadata: { index, revenueRow },
      });
    }
  });
}
