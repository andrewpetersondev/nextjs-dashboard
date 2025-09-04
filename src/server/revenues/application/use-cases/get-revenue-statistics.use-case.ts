import "server-only";

import { createEmptyStatistics } from "@/features/revenues/lib/data/statistics";
import type { RevenueStatistics } from "@/features/revenues/types";
import { serverLogger } from "@/server/logging/serverLogger";
import { computeStatistics } from "@/server/revenues/application/services/revenue-statistics/stats";
import { GetRollingYearRevenuesUseCase } from "@/server/revenues/application/use-cases/get-rolling-year-revenues.use-case";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";

export class GetRevenueStatisticsUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(): Promise<RevenueStatistics> {
    try {
      serverLogger.info({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Calculating revenue statistics",
      });

      const rolling = new GetRollingYearRevenuesUseCase(this.repository);
      const revenueData = await rolling.execute();

      serverLogger.debug({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Retrieved revenue data for statistics calculation",
        revenueDataCount: revenueData.length,
      });

      const stats = computeStatistics(revenueData);

      serverLogger.info({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Successfully calculated revenue statistics",
        monthsWithData: stats.monthsWithData,
        totalRevenue: stats.total,
      });

      return stats;
    } catch (error) {
      serverLogger.error({
        context: "RevenueStatisticsService.calculateStatistics",
        error,
        message:
          "Error calculating revenue statistics; returning empty statistics",
      });
      return createEmptyStatistics();
    }
  }
}
