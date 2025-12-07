import "server-only";
import { createEmptyStatistics } from "@/modules/revenues/domain/data/statistics";
import type { RevenueRepositoryInterface } from "@/modules/revenues/domain/repositories/revenue.repository.interface";
import { computeStatistics } from "@/modules/revenues/domain/services/revenue-statistics";
import type { RevenueStatistics } from "@/modules/revenues/domain/types";
import { GetRollingYearRevenuesUseCase } from "@/modules/revenues/server/application/use-cases/get-rolling-year-revenues.use-case";
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
