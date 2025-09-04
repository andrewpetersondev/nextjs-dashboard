import "server-only";

import { createEmptyStatistics } from "@/features/revenues/lib/data/statistics";
import type { RevenueStatistics } from "@/features/revenues/types";
import { serverLogger } from "@/server/logging/serverLogger";
import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/server/revenues/domain/entity";
import { mapRevenueEntityToDisplayEntity } from "@/server/revenues/mappers/display";
import type { RevenueRepositoryInterface } from "@/server/revenues/repository/interface";
import { mergeWithTemplate } from "@/server/revenues/services/internal/revenue-statistics/merge";
import { computeStatistics } from "@/server/revenues/services/internal/revenue-statistics/stats";
import {
  buildDefaultsFromFreshTemplate,
  buildTemplateAndPeriods,
} from "@/server/revenues/services/internal/revenue-statistics/templates";
import type { Period } from "@/shared/brands/domain-brands";

/**
 * Service for calculating revenue statistics.
 *
 * This service provides methods for calculating revenue statistics for different time periods.
 * It uses the repository pattern for data access and utility functions for data transformation.
 *
 * @remarks
 * This service has been extracted from the RevenueCalculatorService to improve separation of concerns.
 */
export class RevenueStatisticsService {
  /**
   * Creates a new instance of the RevenueStatisticsService.
   *
   * @param repository - The repository for accessing revenue data
   */
  private readonly repository: RevenueRepositoryInterface;

  constructor(repository: RevenueRepositoryInterface) {
    this.repository = repository;
  }

  /**
   * Calculates revenue data for the rolling 12-month period.
   * Ensures all months in the period have data entries, even if no revenue exists.
   *
   * @returns Promise resolving to an array of RevenueDisplayEntity objects
   */
  async calculateForRollingYear(): Promise<RevenueDisplayEntity[]> {
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

  /**
   * Calculates statistical metrics from revenue data for the rolling 12-month period.
   *
   * This is a pure calculation method that doesn't perform database operations directly
   * but calls `calculateForRollingYear()` to get the underlying data.
   *
   * @returns Promise resolving to RevenueStatistics object
   */
  async calculateStatistics(): Promise<RevenueStatistics> {
    try {
      serverLogger.info({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Calculating revenue statistics",
      });

      const revenueData = await this.calculateForRollingYear();

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
