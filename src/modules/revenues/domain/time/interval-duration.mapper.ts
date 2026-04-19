import { INTERVAL_DURATIONS } from "@/modules/revenues/domain/revenue.constants";
import { createEnumValidator } from "@/shared/primitives/core/enums/enum.factory";

/**
 * Validates and converts a value to an IntervalDuration
 */
export const toIntervalDuration = createEnumValidator(
	"IntervalDuration",
	INTERVAL_DURATIONS,
);
