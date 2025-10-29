import "server-only";
import { createEmptyStatistics } from "@/features/revenues/lib/data/statistics";
import type { RevenueStatistics } from "@/features/revenues/types";
import { computeStatistics } from "@/server/revenues/application/services/helpers/stats";
import { GetRollingYearRevenuesUseCase } from "@/server/revenues/application/use-cases/queries/get-rolling-year-revenues.use-case";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import { logger } from "@/shared/logging/logger.shared";

export class GetRevenueStatisticsUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(): Promise<RevenueStatistics> {
    try {
      logger.info("execute");

      const rolling = new GetRollingYearRevenuesUseCase(this.repository);
      const revenueData = await rolling.execute();

      const stats = computeStatistics(revenueData);

      logger.info("computing revenue statistics");

      return stats;
    } catch (error) {
      logger.error("execute revenue stats failed", error);
      return createEmptyStatistics();
    }
  }
}
