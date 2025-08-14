import "server-only";

import type { RevenueRow } from "@/db/schema";
import { ValidationError } from "@/errors/errors";
import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/features/revenues/core/revenue.entity";
import { getMonthName } from "@/features/revenues/core/revenue.types";
import { extractMonthNumberFromPeriod } from "@/features/revenues/utils/date/period.utils";
import { toRevenueSource } from "@/lib/definitions/brands";

/**
 * Maps a raw revenue row from the database to a RevenueEntity object.
 *
 * @param row - Raw revenue data from the database
 * @returns Validated RevenueEntity
 * @throws {ValidationError} When row data is invalid or missing required fields
 */
export function mapRevenueRowToEntity(row: RevenueRow): RevenueEntity {
  if (!row || typeof row !== "object") {
    throw new ValidationError(
      "Invalid revenue row data: expected non-null object",
    );
  }

  // Validate required fields
  if (!row.id) {
    throw new ValidationError(
      "Invalid revenue row: missing required field 'id'",
    );
  }
  if (!row.period) {
    throw new ValidationError(
      "Invalid revenue row: missing required field 'period'",
    );
  }
  if (!row.calculationSource) {
    throw new ValidationError(
      "Invalid revenue row: missing required field 'calculationSource'",
    );
  }
  if (!(row.createdAt instanceof Date)) {
    throw new ValidationError(
      "Invalid revenue row: 'createdAt' must be a Date",
    );
  }
  if (!(row.updatedAt instanceof Date)) {
    throw new ValidationError(
      "Invalid revenue row: 'updatedAt' must be a Date",
    );
  }

  try {
    return {
      calculationSource: toRevenueSource(row.calculationSource),
      createdAt: row.createdAt,
      id: row.id,
      invoiceCount: row.invoiceCount,
      period: row.period,
      totalAmount: row.totalAmount,
      updatedAt: row.updatedAt,
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
 * @param rows - Array of raw revenue data from the database
 * @returns Array of validated RevenueEntity objects
 * @throws {ValidationError} When rows is not an array or contains invalid data
 */
export function mapRevenueRowsToEntities(rows: RevenueRow[]): RevenueEntity[] {
  if (!Array.isArray(rows)) {
    throw new ValidationError("Invalid revenue rows data: expected array");
  }

  return rows.map((row, index) => {
    try {
      return mapRevenueRowToEntity(row);
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
 * @param entity - The revenue entity to transform
 * @returns RevenueDisplayEntity with additional display fields
 * @throws {ValidationError} When entity data is invalid or period cannot be parsed
 */
export function mapRevenueEntityToDisplayEntity(
  entity: RevenueEntity,
): RevenueDisplayEntity {
  if (!entity || typeof entity !== "object") {
    throw new ValidationError(
      "Invalid revenue entity: expected non-null object",
    );
  }

  try {
    const monthNumber = extractMonthNumberFromPeriod(entity.period);
    const yearNumber = entity.period.getUTCFullYear();

    if (Number.isNaN(yearNumber) || yearNumber < 1000 || yearNumber > 9999) {
      throw new ValidationError(`Invalid year extracted from period`);
    }

    return {
      ...entity,
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
 * @param entities - Array of revenue entities to transform
 * @returns Array of RevenueDisplayEntity objects
 * @throws {ValidationError} When entities is not an array or contains invalid data
 */
export function mapRevenueEntitiesToDisplayEntities(
  entities: RevenueEntity[],
): RevenueDisplayEntity[] {
  if (!Array.isArray(entities)) {
    throw new ValidationError("Invalid revenue entities data: expected array");
  }

  return entities.map((entity, index) => {
    try {
      return mapRevenueEntityToDisplayEntity(entity);
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
