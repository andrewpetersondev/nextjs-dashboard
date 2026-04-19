import { REVENUE_SOURCES } from "@/modules/revenues/domain/revenue.types";
import { createEnumValidator } from "@/shared/primitives/core/enums/enum.factory";

/**
 * Validates and converts a value to a RevenueSource.
 */
export const toRevenueSource = createEnumValidator(
	"RevenueSource",
	REVENUE_SOURCES,
);
