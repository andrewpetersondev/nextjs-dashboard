import {
  MAX_REVENUE_MONTHS,
  MAX_REVENUE_YEAR,
  MIN_REVENUE_MONTHS,
  MIN_REVENUE_YEAR,
  MONTH_ORDER,
} from "@/modules/revenues/domain/constants";
import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueDisplayEntity } from "@/modules/revenues/domain/entities/revenue-display.entity";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";

/**
 * Maps RevenueEntity to RevenueDisplayEntity with computed display fields.
 * Moved here from server/application/mappers to allow domain usage.
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <ignore>
export function createRevenueDisplayEntity(
  revenueEntity: RevenueEntity,
): RevenueDisplayEntity {
  if (!revenueEntity || typeof revenueEntity !== "object") {
    throw makeValidationError({
      message: "Invalid revenue entity: expected non-null object",
      metadata: { revenueEntity },
    });
  }
  try {
    const monthNumber = revenueEntity.period.getUTCMonth() + 1;
    const yearNumber = revenueEntity.period.getUTCFullYear();

    // Basic domain validation
    if (
      Number.isNaN(yearNumber) ||
      yearNumber < MIN_REVENUE_YEAR ||
      yearNumber > MAX_REVENUE_YEAR
    ) {
      throw makeValidationError({
        message: "Invalid year extracted from period",
        metadata: { period: revenueEntity.period, yearNumber },
      });
    }

    if (monthNumber < MIN_REVENUE_MONTHS || monthNumber > MAX_REVENUE_MONTHS) {
      throw makeValidationError({
        message: "Invalid month number extracted from period",
        metadata: { monthNumber, period: revenueEntity.period },
      });
    }

    const monthName = MONTH_ORDER[monthNumber - 1];
    if (!monthName) {
      throw makeValidationError({
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
    if (error instanceof Error && error.name === "AppError") {
      throw error;
    }
    throw makeValidationError({
      cause: error instanceof Error ? error : undefined,
      message: `Failed to create display entity: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      metadata: {
        error: error instanceof Error ? error : undefined,
        revenueEntity,
      },
    });
  }
}
