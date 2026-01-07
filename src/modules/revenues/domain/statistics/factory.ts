import type { RevenueStatistics } from "@/modules/revenues/domain/revenue.types";

/**
 * Creates an empty statistics object when no revenue data exists.
 * @returns RevenueStatistics object with all zero values.
 */
export function createEmptyStatistics(): RevenueStatistics {
  return {
    average: 0,
    maximum: 0,
    minimum: 0,
    monthsWithData: 0,
    total: 0,
  };
}
