import "server-only";

import type { RevenueRepositoryContract } from "@/modules/revenues/application/contract/revenue-repository.contract";
import { GetRollingYearRevenuesUseCase } from "@/modules/revenues/application/use-cases/get-rolling-year-revenues.use-case";
import type { RevenueStatistics } from "@/modules/revenues/domain/revenue.types";
import { computeStatistics } from "@/modules/revenues/domain/statistics/calculator";
import { createEmptyStatistics } from "@/modules/revenues/domain/statistics/factory";
import { logger } from "@/shared/logging/infrastructure/logging.client";

export class GetRevenueStatisticsUseCase {
  private readonly repository: RevenueRepositoryContract;

  constructor(repository: RevenueRepositoryContract) {
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
