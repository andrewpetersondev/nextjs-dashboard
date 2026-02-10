import { INTERVAL_DURATIONS } from "@/modules/revenues/domain/revenue.constants";
import { createEnumValidator } from "@/shared/branding/factories/enum-factory";

/**
 * Validates and converts a value to an IntervalDuration
 */
// biome-ignore lint/nursery/useExplicitType: fix
export const toIntervalDuration = createEnumValidator(
  "IntervalDuration",
  INTERVAL_DURATIONS,
);
