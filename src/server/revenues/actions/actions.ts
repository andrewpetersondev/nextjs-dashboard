"use server";

import { getDB } from "@/server/db/connection";
import { serverLogger } from "@/server/logging/serverLogger";
import {
  mapEntityToSimpleRevenueDto,
  mapToStatisticsDto,
} from "@/server/revenues/infrastructure/mappers/dto";
import { RevenueRepository } from "@/server/revenues/infrastructure/repository/repository";
import { RevenueStatisticsService } from "@/server/revenues/services/revenue-statistics.service";
import type { RevenueActionResult } from "@/server/revenues/types/action-result";
import type { RevenueChartDto } from "@/shared/revenues/dto";

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
    const repository = new RevenueRepository(getDB());
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
    serverLogger.error({
      error,
      message: "Get revenue chart action error (rolling 12 months)",
    });
    return { error: "Failed to fetch chart data", success: false };
  }
}
