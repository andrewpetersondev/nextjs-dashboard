import type { RevenueEntity } from "@/modules/revenues/domain/entities/revenue.entity";
import type { RevenueDisplayEntity } from "@/modules/revenues/domain/entities/revenue-display.entity";
import {
  MAX_REVENUE_MONTHS,
  MAX_REVENUE_YEAR,
  MIN_REVENUE_MONTHS,
  MIN_REVENUE_YEAR,
  MONTH_ORDER,
} from "@/modules/revenues/domain/revenue.constants";
import { APP_ERROR_KEYS } from "@/shared/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/errors/factories/app-error.factory";

/**
 * Maps RevenueEntity to RevenueDisplayEntity with computed display fields.
 * Moved here from server/application/mappers to allow domain usage.
 */
export function createRevenueDisplayEntity(
  revenueEntity: RevenueEntity,
): RevenueDisplayEntity {
  if (!revenueEntity || typeof revenueEntity !== "object") {
    throw makeAppError("validation", {
      cause: "",
      message: "Invalid revenue entity: expected non-null object",
      metadata: {},
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
      throw makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: "Invalid year extracted from period",
        metadata: {},
      });
    }

    if (monthNumber < MIN_REVENUE_MONTHS || monthNumber > MAX_REVENUE_MONTHS) {
      throw makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: "Invalid month number extracted from period",
        metadata: {},
      });
    }

    const monthName = MONTH_ORDER[monthNumber - 1];
    if (!monthName) {
      throw makeAppError(APP_ERROR_KEYS.validation, {
        cause: "",
        message: "Invalid month name computed from month number",
        metadata: {},
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
    throw makeAppError(APP_ERROR_KEYS.validation, {
      cause: error instanceof Error ? error : "fix this later",
      message: `Failed to create display entity: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      metadata: {},
    });
  }
}
