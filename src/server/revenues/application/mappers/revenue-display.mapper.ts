import "server-only";
import {
  MAX_REVENUE_MONTHS,
  MAX_REVENUE_YEAR,
  MIN_REVENUE_MONTHS,
  MIN_REVENUE_YEAR,
  MONTH_ORDER,
} from "@/features/revenues/constants/date";
import type { RevenueEntity } from "@/server/revenues/domain/entities/entity";
import type { RevenueDisplayEntity } from "@/server/revenues/domain/entities/entity.client";
import { BaseError } from "@/shared/errors/base-error";

/**
 * Maps RevenueEntity to RevenueDisplayEntity with computed display fields.
 *
 * @param revenueEntity - The revenue entity to transform
 * @returns RevenueDisplayEntity with additional display fields
 * @throws {BaseError} (code: "validation") When entity data is invalid or period cannot be parsed
 */
export function mapRevenueEntityToDisplayEntity(
  revenueEntity: RevenueEntity,
): RevenueDisplayEntity {
  if (!revenueEntity || typeof revenueEntity !== "object") {
    throw new BaseError("validation", {
      message: "Invalid revenue entity: expected non-null object",
    });
  }
  try {
    const monthNumber = revenueEntity.period.getUTCMonth() + 1;
    const yearNumber = revenueEntity.period.getUTCFullYear();
    if (
      Number.isNaN(yearNumber) ||
      yearNumber < MIN_REVENUE_YEAR ||
      yearNumber > MAX_REVENUE_YEAR
    ) {
      throw new BaseError("validation", {
        context: { period: revenueEntity.period, yearNumber },
        message: "Invalid year extracted from period",
      });
    }

    if (monthNumber < MIN_REVENUE_MONTHS || monthNumber > MAX_REVENUE_MONTHS) {
      throw new BaseError("validation", {
        context: { monthNumber, period: revenueEntity.period },
        message: "Invalid month number extracted from period",
      });
    }
    const monthName = MONTH_ORDER[monthNumber - 1];
    if (!monthName) {
      throw new BaseError("validation", {
        context: { monthNumber },
        message: "Invalid month name computed from month number",
      });
    }
    return {
      ...revenueEntity,
      month: monthName,
      monthNumber,
      year: yearNumber,
    };
  } catch (error) {
    if (error instanceof BaseError) {
      // Preserve existing BaseError details but add context that this failed in the mapper
      throw error.withContext({ scope: "mapRevenueEntityToDisplayEntity" });
    }

    throw new BaseError("validation", {
      cause: error instanceof Error ? error : undefined,
      context: { revenueEntity },
      message: `Failed to map revenue entity to display entity: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
}
