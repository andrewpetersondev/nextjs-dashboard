import "server-only";
import type { RevenueDisplayEntity } from "@/modules/revenues/domain/entities/revenue-display.entity";
import type { RevenueStatistics } from "@/modules/revenues/domain/revenue.types";
import { createEmptyStatistics } from "@/modules/revenues/domain/statistics/factory";

function nonZeroAmounts(
  revenueData: readonly RevenueDisplayEntity[],
): number[] {
  return revenueData
    .filter((entity) => entity.totalAmount > 0)
    .map((entity) => entity.totalAmount);
}

/**
 * Computes revenue statistics from display entities.
 * @param revenueData - Array of revenue display entities.
 * @returns Computed statistics or empty if no data.
 */
export function computeStatistics(
  revenueData: readonly RevenueDisplayEntity[] | undefined | null,
): RevenueStatistics {
  if (!revenueData || revenueData.length === 0) {
    return createEmptyStatistics();
  }

  const nonZeroRevenues = nonZeroAmounts(revenueData);
  if (nonZeroRevenues.length === 0) {
    return createEmptyStatistics();
  }

  const average = Math.round(
    revenueData.reduce((sum, value) => sum + value.totalAmount, 0) /
      nonZeroRevenues.length,
  );
  const maximum = Math.max(...nonZeroRevenues);
  const minimum = Math.min(...nonZeroRevenues);
  const monthsWithData = nonZeroRevenues.length;
  const total = revenueData.reduce((sum, value) => sum + value.totalAmount, 0);

  return {
    average,
    maximum,
    minimum,
    monthsWithData,
    total,
  } satisfies RevenueStatistics;
}
