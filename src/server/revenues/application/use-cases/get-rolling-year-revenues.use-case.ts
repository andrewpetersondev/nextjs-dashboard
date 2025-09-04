import "server-only";

import { serverLogger } from "@/server/logging/serverLogger";
import { mapRevenueEntityToDisplayEntity } from "@/server/revenues/application/mappers/display";
import { mergeWithTemplate } from "@/server/revenues/application/services/revenue-statistics/merge";
import {
  buildDefaultsFromFreshTemplate,
  buildTemplateAndPeriods,
} from "@/server/revenues/application/services/revenue-statistics/templates";
import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/server/revenues/domain/entities/entity";
import type { RevenueRepositoryInterface } from "@/server/revenues/infrastructure/repository/interface";
import type { Period } from "@/shared/brands/domain-brands";

export class GetRollingYearRevenuesUseCase {
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  async execute(): Promise<RevenueDisplayEntity[]> {
    try {
      serverLogger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        message: "Calculating rolling 12-month revenue data",
      });

      const { template, startPeriod, endPeriod } = buildTemplateAndPeriods();

      const displayEntities = await this.fetchDisplayEntities(
        startPeriod,
        endPeriod,
      );

      const result = mergeWithTemplate(template, displayEntities);

      serverLogger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        message: "Successfully calculated rolling 12-month revenue data",
        resultCount: result.length,
        withDataCount: displayEntities.length,
      });
      return result;
    } catch (error) {
      serverLogger.error({
        context: "RevenueStatisticsService.calculateForRollingYear",
        error,
        message:
          "Error calculating rolling 12-month revenue data; returning defaults",
      });
      try {
        return buildDefaultsFromFreshTemplate();
      } catch (fallbackError) {
        serverLogger.error({
          context: "RevenueStatisticsService.calculateForRollingYear",
          error: fallbackError,
          message:
            "Fallback template generation failed; returning empty dataset",
        });
        return [];
      }
    }
  }

  private async fetchDisplayEntities(
    startPeriod: Period,
    endPeriod: Period,
  ): Promise<RevenueDisplayEntity[]> {
    const revenueEntities: RevenueEntity[] =
      await this.repository.findByDateRange(startPeriod, endPeriod);

    serverLogger.debug({
      context: "RevenueStatisticsService.calculateForRollingYear",
      entityCount: revenueEntities.length,
      message: "Fetched revenue data from repository",
    });

    const displayEntities = revenueEntities.map(
      (entity: RevenueEntity): RevenueDisplayEntity =>
        mapRevenueEntityToDisplayEntity(entity),
    );

    serverLogger.debug({
      context: "RevenueStatisticsService.calculateForRollingYear",
      displayEntityCount: displayEntities.length,
      message: "Transformed revenue entities to display entities",
    });

    return displayEntities;
  }
}
