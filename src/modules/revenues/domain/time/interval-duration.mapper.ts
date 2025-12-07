import { INTERVAL_DURATIONS } from "@/modules/revenues/domain/constants";
import { createEnumValidator } from "@/shared/branding/factories/enum-factory";

/**
 * Validates and converts a value to an IntervalDuration
 */
export const toIntervalDuration = createEnumValidator(
  "IntervalDuration",
  INTERVAL_DURATIONS,
);
