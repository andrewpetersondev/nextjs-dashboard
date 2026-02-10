import { REVENUE_SOURCES } from "@/modules/revenues/domain/revenue.types";
import { createEnumValidator } from "@/shared/branding/factories/enum-factory";

/**
 * Validates and converts a value to a RevenueSource.
 */
// biome-ignore lint/nursery/useExplicitType: fix
export const toRevenueSource = createEnumValidator(
  "RevenueSource",
  REVENUE_SOURCES,
);
