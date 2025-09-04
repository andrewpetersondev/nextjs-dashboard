import "server-only";

import { createEmptyStatistics } from "@/features/revenues/lib/data/statistics";
import { generateMonthsTemplate } from "@/features/revenues/lib/data/template.client";
import { calculateDateRange } from "@/features/revenues/lib/date/range";
import type { RevenueStatistics } from "@/features/revenues/types";
import { serverLogger } from "@/server/logging/serverLogger";
import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/server/revenues/domain/entity";
import { mapRevenueEntityToDisplayEntity } from "@/server/revenues/mappers/display";
import type { RevenueRepositoryInterface } from "@/server/revenues/repository/interface";
import { createDefaultRevenueData } from "@/server/revenues/utils/template";
import { toIntervalDuration } from "@/server/revenues/validation/validator";
import type { Period } from "@/shared/brands/domain-brands";
import { toPeriod } from "@/shared/brands/mappers";

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

      const { template, startPeriod, endPeriod } =
        this.buildTemplateAndPeriods();

      const displayEntities = await this.fetchDisplayEntities(
        startPeriod,
        endPeriod,
      );

      const result = this.mergeWithTemplate(template, displayEntities);

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
        return this.buildDefaultsFromFreshTemplate();
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

  private buildTemplateAndPeriods(): {
    readonly template: readonly { readonly period: Period }[];
    readonly startPeriod: Period;
    readonly endPeriod: Period;
  } {
    const { startDate, endDate, duration } = calculateDateRange();
    serverLogger.debug({
      context: "RevenueStatisticsService.calculateForRollingYear",
      duration,
      endDate,
      message: "Calculated date range for a rolling 12-month period",
      startDate,
    });

    const template = generateMonthsTemplate(
      startDate,
      toIntervalDuration(duration),
    );

    if (template.length === 0) {
      throw new Error("Template generation failed: no months generated");
    }

    const firstMonth = template[0];
    const lastMonth = template[template.length - 1];
    if (!firstMonth || !lastMonth) {
      throw new Error("Template generation failed: invalid month data");
    }

    const startPeriod = firstMonth.period;
    const endPeriod = lastMonth.period;

    serverLogger.debug({
      context: "RevenueStatisticsService.calculateForRollingYear",
      endPeriod,
      message: "Prepared template for a 12-month period",
      startPeriod,
      templateMonths: template.length,
    });

    return { endPeriod, startPeriod, template };
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

  private mergeWithTemplate(
    template: readonly { readonly period: Date }[],
    displayEntities: readonly RevenueDisplayEntity[],
  ): RevenueDisplayEntity[] {
    const dataLookup = new Map<number, RevenueDisplayEntity>(
      displayEntities.map((e) => [e.period.getTime(), e] as const),
    );
    return template.map(
      (t) =>
        dataLookup.get(t.period.getTime()) ??
        createDefaultRevenueData(toPeriod(t.period)),
    );
  }

  private buildDefaultsFromFreshTemplate(): RevenueDisplayEntity[] {
    const { startDate, duration } = calculateDateRange();
    const template = generateMonthsTemplate(
      startDate,
      toIntervalDuration(duration),
    );
    return template.map((t) => createDefaultRevenueData(toPeriod(t.period)));
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

      const stats = this.computeStatistics(revenueData);

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

  private computeStatistics(
    revenueData: readonly RevenueDisplayEntity[],
  ): RevenueStatistics {
    if (!revenueData || revenueData.length === 0) {
      serverLogger.debug({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "No revenue data available, returning empty statistics",
      });
      return createEmptyStatistics();
    }

    const nonZeroRevenues = this.nonZeroAmounts(revenueData);
    if (nonZeroRevenues.length === 0) {
      serverLogger.debug({
        context: "RevenueStatisticsService.calculateStatistics",
        message:
          "No non-zero revenue data available, returning empty statistics",
      });
      return createEmptyStatistics();
    }

    const maximum = Math.max(...nonZeroRevenues);
    const minimum = Math.min(...nonZeroRevenues);
    const total = revenueData.reduce(
      (sum, value) => sum + value.totalAmount,
      0,
    );
    const average = Math.round(total / nonZeroRevenues.length);

    return {
      average,
      maximum,
      minimum,
      monthsWithData: nonZeroRevenues.length,
      total,
    } satisfies RevenueStatistics;
  }

  private nonZeroAmounts(
    revenueData: readonly RevenueDisplayEntity[],
  ): number[] {
    return revenueData
      .filter((entity) => entity.totalAmount > 0)
      .map((entity) => entity.totalAmount);
  }
}
