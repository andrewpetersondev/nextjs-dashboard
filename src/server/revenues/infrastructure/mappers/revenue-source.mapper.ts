import { REVENUE_SOURCES } from "@/features/revenues/domain/types";
import { createEnumValidator } from "@/shared/branding/factories/enum-factory";

/**
 * Validates and converts a value to a RevenueSource
 */
export const toRevenueSource = createEnumValidator(
  "RevenueSource",
  REVENUE_SOURCES,
);
