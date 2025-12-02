"use server";

import type { RevenueChartDto } from "@/features/revenues/domain/types";
import { getAppDb } from "@/server/db/db.connection";
import {
  mapEntityToSimpleRevenueDto,
  mapToStatisticsDto,
} from "@/server/revenues/application/mappers/revenue-dto.mapper";
import { RevenueStatisticsService } from "@/server/revenues/application/services/statistics/statistics.service";
import type { RevenueActionResult } from "@/server/revenues/application/types/action-result";
import { RevenueRepository } from "@/server/revenues/infrastructure/repository/repository";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Retrieves complete revenue chart data for the last 12 months with statistical metrics.
 *
 * @returns Promise resolving to RevenueActionResult containing chart data or error
 *
 * @throws {Error} When database connection fails
 * @throws {Error} When revenue calculation service encounters errors
 * @throws {Error} When data transformation fails
 *
 */
export async function getRevenueChartAction(): Promise<
  RevenueActionResult<RevenueChartDto>
> {
  try {
    const repository = new RevenueRepository(getAppDb());
    const service = new RevenueStatisticsService(repository);

    const [entities, rawStatistics] = await Promise.all([
      service.calculateForRollingYear(),
      service.calculateStatistics(),
    ]);

    const monthlyData = entities.map(mapEntityToSimpleRevenueDto);
    const statistics = mapToStatisticsDto(rawStatistics);

    return {
      data: {
        monthlyData,
        statistics,
        year: new Date().getFullYear(),
      },
      success: true,
    };
  } catch (error) {
    logger.error("Get revenue chart action error (rolling 12 months)", {
      error,
      message: "Get revenue chart action error (rolling 12 months)",
    });
    return { error: "Failed to fetch chart data", success: false };
  }
}
