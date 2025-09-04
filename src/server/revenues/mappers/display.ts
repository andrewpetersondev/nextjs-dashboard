import "server-only";

import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/server/revenues/entity";
import { ValidationError } from "@/shared/errors/domain";
import {
  MAX_REVENUE_MONTHS,
  MAX_REVENUE_YEAR,
  MIN_REVENUE_MONTHS,
  MIN_REVENUE_YEAR,
  MONTH_ORDER,
} from "@/shared/revenues/types";

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
