import "server-only";

import { toPeriod, toRevenueId } from "@/core/types/domain-brands";
import { ValidationError } from "@/errors/errors";
import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/features/revenues/core/entity";
import { toRevenueSource } from "@/features/revenues/core/validator";
import { getMonthName } from "@/features/revenues/utils/date/date";
import { extractMonthNumberFromPeriod } from "@/features/revenues/utils/date/period";
import type { RevenueRow } from "@/server/db/schema";
import { isValidDate } from "@/shared/utils/date";
import {
  isNonNegativeInteger,
  isNonNegativeNumber,
} from "@/shared/validation/number";

// Small internal assertion helper to keep validation DRY and readable
const ensure = (condition: unknown, message: string): void => {
  if (!condition) {
    throw new ValidationError(message);
  }
};

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

/**
 * Maps RevenueEntity to RevenueDisplayEntity with computed display fields.
 *
 * @param revenueEntity - The revenue entity to transform
 * @returns RevenueDisplayEntity with additional display fields
 * @throws {ValidationError} When entity data is invalid or period cannot be parsed
 */
export function mapRevenueEntityToDisplayEntity(
  revenueEntity: RevenueEntity,
): RevenueDisplayEntity {
  if (!revenueEntity || typeof revenueEntity !== "object") {
    throw new ValidationError(
      "Invalid revenue entity: expected non-null object",
    );
  }

  try {
    const monthNumber = extractMonthNumberFromPeriod(revenueEntity.period);
    const yearNumber = revenueEntity.period.getUTCFullYear();

    if (Number.isNaN(yearNumber) || yearNumber < 1000 || yearNumber > 9999) {
      throw new ValidationError(`Invalid year extracted from period`);
    }

    return {
      ...revenueEntity,
      month: getMonthName(monthNumber),
      monthNumber,
      year: yearNumber,
    };
  } catch (error) {
    throw new ValidationError(
      `Failed to map revenue entity to display entity: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Maps an array of RevenueEntity objects to RevenueDisplayEntity objects.
 *
 * @param revenueEntities - Array of revenue entities to transform
 * @returns Array of RevenueDisplayEntity objects
 * @throws {ValidationError} When entities is not an array or contains invalid data
 */
export function mapRevenueEntitiesToDisplayEntities(
  revenueEntities: RevenueEntity[],
): RevenueDisplayEntity[] {
  if (!Array.isArray(revenueEntities)) {
    throw new ValidationError("Invalid revenue entities data: expected array");
  }

  return revenueEntities.map((revenueEntity, index) => {
    try {
      return mapRevenueEntityToDisplayEntity(revenueEntity);
    } catch (error) {
      throw new ValidationError(
        `Failed to map revenue entity at index ${index}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  });
}

// Backward compatibility aliases (deprecated - use new names)
/** @deprecated Use mapRevenueRowToEntity instead */
export const mapRevRowToRevEnt = mapRevenueRowToEntity;

/** @deprecated Use mapRevenueEntityToDisplayEntity instead */
export const mapRevEntToRevDisplayEnt = mapRevenueEntityToDisplayEntity;
