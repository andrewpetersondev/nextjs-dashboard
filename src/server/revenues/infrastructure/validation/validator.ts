import "server-only";

import { REVENUE_SOURCES, type RevenueSource } from "@/features/revenues/types";
import { validateEnum } from "@/shared/core/validation/enum";

import { INTERVAL_DURATIONS } from "@/shared/revenues/constants/date";
import type { IntervalDuration } from "@/shared/revenues/types";

/**
 * Validates and converts a value to an IntervalDuration
 * @param duration - The duration value to validate
 * @returns A validated IntervalDuration
 * @throws {ValidationError} If the duration is invalid
 */
export const toIntervalDuration = (duration: unknown): IntervalDuration => {
  return validateEnum(duration, INTERVAL_DURATIONS, "IntervalDuration");
};
/**
 * Validates and converts a value to a RevenueSource
 * @param source - The source value to validate
 * @returns A validated RevenueSource
 * @throws {ValidationError} If the source is invalid
 */
export const toRevenueSource = (source: unknown): RevenueSource => {
  return validateEnum(source, REVENUE_SOURCES, "RevenueSource");
};
