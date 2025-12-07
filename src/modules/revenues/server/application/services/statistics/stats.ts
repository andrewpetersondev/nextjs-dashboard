import "server-only";
import { createEmptyStatistics } from "@/modules/revenues/domain/data/statistics";
import type { RevenueStatistics } from "@/modules/revenues/domain/types";
import type { RevenueDisplayEntity } from "@/modules/revenues/server/domain/entities/entity.client";
import { logger } from "@/shared/logging/infrastructure/logging.client";

export function computeStatistics(
  revenueData: readonly RevenueDisplayEntity[] | undefined | null,
): RevenueStatistics {
  if (!revenueData || revenueData.length === 0) {
    logger.debug("No revenue data available, returning empty statistics", {
      context: "RevenueStatisticsService.calculateStatistics",
    });
    return createEmptyStatistics();
  }

  const nonZeroRevenues = nonZeroAmounts(revenueData);
  if (nonZeroRevenues.length === 0) {
    logger.debug(
      "No non-zero revenue data available, returning empty statistics",
      {
        context: "RevenueStatisticsService.calculateStatistics",
      },
    );
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
