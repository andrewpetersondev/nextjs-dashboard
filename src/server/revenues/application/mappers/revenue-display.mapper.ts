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
import { AppError } from "@/shared/errors/core/app-error.class";

/**
 * Maps RevenueEntity to RevenueDisplayEntity with computed display fields.
 *
 * @param revenueEntity - The revenue entity to transform
 * @returns RevenueDisplayEntity with additional display fields
 * @throws {AppError} (code: "validation") When entity data is invalid or period cannot be parsed
 */
export function mapRevenueEntityToDisplayEntity(
  revenueEntity: RevenueEntity,
): RevenueDisplayEntity {
  if (!revenueEntity || typeof revenueEntity !== "object") {
    throw new AppError("validation", {
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
      throw new AppError("validation", {
        message: "Invalid year extracted from period",
        metadata: { period: revenueEntity.period, yearNumber },
      });
    }

    if (monthNumber < MIN_REVENUE_MONTHS || monthNumber > MAX_REVENUE_MONTHS) {
      throw new AppError("validation", {
        message: "Invalid month number extracted from period",
        metadata: { monthNumber, period: revenueEntity.period },
      });
    }
    const monthName = MONTH_ORDER[monthNumber - 1];
    if (!monthName) {
      throw new AppError("validation", {
        message: "Invalid month name computed from month number",
        metadata: { monthNumber },
      });
    }
    return {
      ...revenueEntity,
      month: monthName,
      monthNumber,
      year: yearNumber,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("validation", {
      cause: error instanceof Error ? error : undefined,
      message: `Failed to map revenue entity to display entity: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      metadata: { revenueEntity },
    });
  }
}
