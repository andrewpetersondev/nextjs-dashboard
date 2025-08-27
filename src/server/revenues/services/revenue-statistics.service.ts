import "server-only";

import type { RevenueStatistics } from "@/features/revenues/core/types";
import { createEmptyStatistics } from "@/features/revenues/lib/data/statistics";
import { generateMonthsTemplate } from "@/features/revenues/lib/data/template.client";
import { calculateDateRange } from "@/features/revenues/lib/date/range";
import { serverLogger } from "@/server/logging/serverLogger";
import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/server/revenues/entity";
import { mapRevenueEntityToDisplayEntity } from "@/server/revenues/mappers";
import type { RevenueRepositoryInterface } from "@/server/revenues/repository-interface";
import { createDefaultRevenueData } from "@/server/revenues/utils/template";
import { toIntervalDuration } from "@/server/revenues/validator";

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
  constructor(private readonly repository: RevenueRepositoryInterface) {}

  /**
   * Calculates revenue data for the rolling 12-month period.
   * Ensures all months in the period have data entries, even if no revenue exists.
   *
   * @returns Promise resolving to an array of RevenueDisplayEntity objects
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
  async calculateForRollingYear(): Promise<RevenueDisplayEntity[]> {
    try {
      serverLogger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        message: "Calculating rolling 12-month revenue data",
      });

      // Calculate the date range for the rolling 12-month period.
      const { startDate, endDate, duration } = calculateDateRange();

      serverLogger.debug({
        context: "RevenueStatisticsService.calculateForRollingYear",
        duration,
        endDate,
        message: "Calculated date range for a rolling 12-month period",
        startDate,
      });

      // Generate the template for the 12-month duration
      const template = generateMonthsTemplate(
        startDate,
        toIntervalDuration(duration),
      );

      // Extract the start and end periods from the template
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

      // Fetch revenue data from the repository
      const revenueEntities: RevenueEntity[] =
        await this.repository.findByDateRange(startPeriod, endPeriod);

      // 9 entities are returned
      serverLogger.debug({
        context: "RevenueStatisticsService.calculateForRollingYear",
        entityCount: revenueEntities.length,
        message: "Fetched revenue data from repository",
      });

      // Transform the revenue entities to display entities
      const displayEntities: RevenueDisplayEntity[] = revenueEntities.map(
        (entity: RevenueEntity): RevenueDisplayEntity =>
          mapRevenueEntityToDisplayEntity(entity),
      );

      serverLogger.debug({
        context: "RevenueStatisticsService.calculateForRollingYear",
        displayEntityCount: displayEntities.length,
        message: "Transformed revenue entities to display entities",
      });

      // Merge the display entities with the template (template-driven order)
      const dataLookup = new Map<number, RevenueDisplayEntity>(
        displayEntities.map((e) => [e.period.getTime(), e] as const),
      );

      const result: RevenueDisplayEntity[] = template.map(
        (t) =>
          dataLookup.get(t.period.getTime()) ??
          createDefaultRevenueData(t.period),
      );

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
      // Fallback path: attempt to build a fresh template and return defaults
      try {
        const { startDate, duration } = calculateDateRange();
        const template = generateMonthsTemplate(
          startDate,
          toIntervalDuration(duration),
        );
        return template.map((t) => createDefaultRevenueData(t.period));
      } catch (fallbackError) {
        serverLogger.error({
          context: "RevenueStatisticsService.calculateForRollingYear",
          error: fallbackError,
          message:
            "Fallback template generation failed; returning empty dataset",
        });
        // Final fallback: avoid throwing to prevent a UI error path
        return [];
      }
    }
  }

  /**
   * Calculates statistical metrics from revenue data for the rolling 12-month period.
   *
   * This is a pure calculation method that doesn't perform database operations directly
   * but calls `calculateForRollingYear()` to get the underlying data.
   *
   * @returns Promise resolving to RevenueStatistics object
   */
  // biome-ignore lint/complexity/noExcessiveLinesPerFunction: <fix later>
  async calculateStatistics(): Promise<RevenueStatistics> {
    try {
      serverLogger.info({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Calculating revenue statistics",
      });

      // Get the revenue data for the rolling 12-month period
      const revenueData = await this.calculateForRollingYear();

      serverLogger.debug({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Retrieved revenue data for statistics calculation",
        revenueDataCount: revenueData.length,
      });

      // If there's no data, return empty statistics
      if (!revenueData || revenueData.length === 0) {
        serverLogger.debug({
          context: "RevenueStatisticsService.calculateStatistics",
          message: "No revenue data available, returning empty statistics",
        });
        return createEmptyStatistics();
      }

      // Filter out months with zero revenues for min/max/average calculations
      const nonZeroRevenues = revenueData
        .filter((entity) => entity.totalAmount > 0)
        .map((entity) => entity.totalAmount);

      // If there are no non-zero revenues, return empty statistics
      if (nonZeroRevenues.length === 0) {
        serverLogger.debug({
          context: "RevenueStatisticsService.calculateStatistics",
          message:
            "No non-zero revenue data available, returning empty statistics",
        });
        return createEmptyStatistics();
      }

      // Calculate statistics
      const maximum = Math.max(...nonZeroRevenues);
      const minimum = Math.min(...nonZeroRevenues);
      const total = revenueData.reduce(
        (sum, value) => sum + value.totalAmount,
        0,
      );
      const average = Math.round(total / nonZeroRevenues.length);

      const statistics: RevenueStatistics = {
        average,
        maximum,
        minimum,
        monthsWithData: nonZeroRevenues.length,
        total,
      };

      serverLogger.info({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Successfully calculated revenue statistics",
        monthsWithData: statistics.monthsWithData,
        totalRevenue: statistics.total,
      });

      return statistics;
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
