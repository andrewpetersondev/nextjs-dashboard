import { REVENUE_SOURCES, type RevenueSource } from "@/features/revenues/types";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result.types";
import { validateEnumResult } from "@/shared/validation/validate-enum-result";

/**
 * Validates and converts a value to a RevenueSource
 * @param source - The source value to validate
 * @returns Result<RevenueSource, AppError>
 */
export const toRevenueSource = (
  source: unknown,
): Result<RevenueSource, AppError> => {
  return validateEnumResult(source, REVENUE_SOURCES, "RevenueSource");
};
