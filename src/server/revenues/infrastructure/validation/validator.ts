import "server-only";
import {
  INTERVAL_DURATIONS,
  type IntervalDuration,
} from "@/features/revenues/constants/date";
import { REVENUE_SOURCES, type RevenueSource } from "@/features/revenues/types";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result";
import { validateEnumResult } from "@/shared/validation/domain/enum";

/**
 * Validates and converts a value to an IntervalDuration
 * @param duration - The duration value to validate
 * @returns Result<IntervalDuration, AppError>
 */
export const toIntervalDuration = (
  duration: unknown,
): Result<IntervalDuration, AppError> => {
  return validateEnumResult(duration, INTERVAL_DURATIONS, "IntervalDuration");
};
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
