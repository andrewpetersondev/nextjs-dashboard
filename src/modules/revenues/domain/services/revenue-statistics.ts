import "server-only";
import { createEmptyStatistics } from "@/modules/revenues/domain/data/statistics";
import type { RevenueDisplayEntity } from "@/modules/revenues/domain/entities/entity.client";
import type { RevenueStatistics } from "@/modules/revenues/domain/types";

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

  const maximum = Math.max(...nonZeroRevenues);
  const minimum = Math.min(...nonZeroRevenues);
  const total = revenueData.reduce((sum, value) => sum + value.totalAmount, 0);
  const average = Math.round(total / nonZeroRevenues.length);

  return {
    average,
    maximum,
    minimum,
    monthsWithData: nonZeroRevenues.length,
    total,
  } satisfies RevenueStatistics;
}

export function nonZeroAmounts(
  revenueData: readonly RevenueDisplayEntity[],
): number[] {
  return revenueData
    .filter((entity) => entity.totalAmount > 0)
    .map((entity) => entity.totalAmount);
}
