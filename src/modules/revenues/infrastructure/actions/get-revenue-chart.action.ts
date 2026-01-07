"use server";
import { RevenueStatisticsService } from "@/modules/revenues/application/services/revenue-statistics.service";
import type { RevenueChartDto } from "@/modules/revenues/domain/revenue.types";
import {
  mapEntityToSimpleRevenueDto,
  mapToStatisticsDto,
} from "@/modules/revenues/infrastructure/mappers/revenue-dto.mapper";
import { RevenueRepository } from "@/modules/revenues/infrastructure/repository/revenue.repository";
import { getAppDb } from "@/server/db/db.connection";
import { logger } from "@/shared/logging/infrastructure/logging.client";

/**
 * Standard discriminated union type for revenue operation results.
 *
 * Provides a consistent success / error response structure across all revenue
 * actions and services. Enables type-safe error handling and result processing.
 *
 * @template T - The type of data returned on successful operations
 */
type RevenueActionResult<T> =
  | { readonly error: string; readonly success: false }
  | { readonly data: T; readonly success: true };

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
