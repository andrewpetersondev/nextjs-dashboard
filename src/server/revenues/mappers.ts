import "server-only";

import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/server/revenues/entity";
import {
  monthAbbreviationFromNumber,
  validateMonthNumber,
} from "@/server/revenues/helpers";
import { toRevenueSource } from "@/server/revenues/validator";
import { toPeriod, toRevenueId } from "@/shared/brands/mappers";
import { ValidationError } from "@/shared/errors/domain";
import { convertCentsToDollars } from "@/shared/money/convert";
import type { RevenueStatisticsDto } from "@/shared/revenues/dto";
import {
  MAX_REVENUE_MONTHS,
  MAX_REVENUE_YEAR,
  MIN_REVENUE_MONTHS,
  MIN_REVENUE_YEAR,
  MONTH_ORDER,
  type SimpleRevenueDto,
} from "@/shared/revenues/types";
import { isValidDate } from "@/shared/utils/date";
import { ensure } from "@/shared/validation/ensure";
import {
  isNonNegativeInteger,
  isNonNegativeNumber,
} from "@/shared/validation/number";
import type { RevenueRow } from "../../../node-only/schema/revenues";

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
    const monthNumber = revenueEntity.period.getUTCMonth() + 1;
    const yearNumber = revenueEntity.period.getUTCFullYear();
    if (
      Number.isNaN(yearNumber) ||
      yearNumber < MIN_REVENUE_YEAR ||
      yearNumber > MAX_REVENUE_YEAR
    ) {
      throw new ValidationError("Invalid year extracted from period");
    }
    // if (monthNumber < 1 || monthNumber > 12) {}
    if (monthNumber < MIN_REVENUE_MONTHS || monthNumber > MAX_REVENUE_MONTHS) {
      throw new ValidationError("Invalid month number extracted from period");
    }
    const monthName = MONTH_ORDER[monthNumber - 1];
    if (!monthName) {
      throw new ValidationError(
        "Invalid month name computed from month number",
      );
    }
    return {
      ...revenueEntity,
      month: monthName,
      monthNumber,
      year: yearNumber,
    };
  } catch (error) {
    throw new ValidationError(
      `Failed to map revenue entity to display entity: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export function mapEntityToSimpleRevenueDto(
  entity: { period: Date; totalAmount: number },
  index: number,
): SimpleRevenueDto {
  const monthNumber = entity.period.getUTCMonth() + 1;
  validateMonthNumber(monthNumber, entity.period);
  const month = monthAbbreviationFromNumber(monthNumber);
  return {
    month,
    monthNumber: index + 1,
    totalAmount: convertCentsToDollars(entity.totalAmount),
  };
}

export function mapToStatisticsDto(raw: {
  average: number;
  maximum: number;
  minimum: number;
  monthsWithData: number;
  total: number;
}): RevenueStatisticsDto {
  return {
    average: convertCentsToDollars(raw.average),
    maximum: convertCentsToDollars(raw.maximum),
    minimum: convertCentsToDollars(raw.minimum),
    monthsWithData: raw.monthsWithData,
    total: convertCentsToDollars(raw.total),
  };
}
