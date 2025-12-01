import "server-only";
import {
  INTERVAL_DURATIONS,
  type IntervalDuration,
} from "@/features/revenues/constants/date";
import type { AppError } from "@/shared/errors/core/app-error.class";
import type { Result } from "@/shared/result/result.types";
import { validateEnumResult } from "@/shared/validation/validate-enum-result";

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
