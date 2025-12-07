import "server-only";
import { createEmptyStatistics } from "@/modules/revenues/domain/data/statistics";
import type { RevenueStatistics } from "@/modules/revenues/domain/types";
import { computeStatistics } from "@/modules/revenues/server/application/services/statistics/stats";
import { GetRollingYearRevenuesUseCase } from "@/modules/revenues/server/application/use-cases/queries/get-rolling-year-revenues.use-case";
import type { RevenueRepositoryInterface } from "@/modules/revenues/server/infrastructure/repository/interface";
import { logger } from "@/shared/logging/infrastructure/logging.client";

export class GetRevenueStatisticsUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(): Promise<RevenueStatistics> {
    try {
      const rolling = new GetRollingYearRevenuesUseCase(this.repository);
      const revenueData = await rolling.execute();

      const stats = computeStatistics(revenueData);

      return stats;
    } catch (error) {
      logger.error("execute revenue stats failed", error);
      return createEmptyStatistics();
    }
  }
}
