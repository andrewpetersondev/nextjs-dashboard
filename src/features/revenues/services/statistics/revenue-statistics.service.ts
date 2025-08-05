import "server-only";

import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/features/revenues/core/revenue.entity";
import { mapRevEntToRevDisplayEnt } from "@/features/revenues/core/revenue.mapper";
import type { RevenueStatistics } from "@/features/revenues/core/revenue.types";
import type { RevenueRepositoryInterface } from "@/features/revenues/repository/revenue.repository.interface";
import {
  createEmptyStatistics,
  mergeDataWithTemplate,
} from "@/features/revenues/utils/data/revenue-data.utils";
import { createDefaultRevenueData } from "@/features/revenues/utils/data/template.utils";
import {
  calculateDateRange,
  generateMonthlyPeriods,
  generateMonthsTemplate,
  isValidISODate,
} from "@/features/revenues/utils/date/revenue-date.utils";
import { toPeriodDuration } from "@/lib/definitions/brands";
import { logger } from "@/lib/utils/logger";

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
   * Uses the repository to fetch data and transforms it into the required format.
   *
   * @returns Promise resolving to array of RevenueDisplayEntity objects
   */
  async calculateForRollingYear(): Promise<RevenueDisplayEntity[]> {
    try {
      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        message: "Calculating rolling 12-month revenue data",
      });

      // Calculate the date range for the rolling 12-month period.
      const { startDate, endDate, period } = calculateDateRange();

      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        endDate,
        message: "Calculated date range for rolling 12-month period",
        startDate,
      });

      // Generate the template for the 12-month period
      const template = generateMonthsTemplate(
        startDate,
        toPeriodDuration(period),
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

      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        message: "Generated template for 12-month period",
        templateMonths: template.length,
      });

      const startPeriod = `${firstMonth.year}-${String(
        firstMonth.monthNumber,
      ).padStart(2, "0")}`;

      const endPeriod = `${lastMonth.year}-${String(
        lastMonth.monthNumber,
      ).padStart(2, "0")}`;

      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        endPeriod,
        message: "Extracted start and end periods from template",
        startPeriod,
      });

      // Fetch revenue data from the repository
      const revenueEntities = await this.repository.findByDateRange(
        startPeriod,
        endPeriod,
      );

      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        entityCount: revenueEntities.length,
        message: "Fetched revenue data from repository",
      });

      // Transform the revenue entities to display entities
      const displayEntities = revenueEntities.map((entity) =>
        mapRevEntToRevDisplayEnt(entity),
      );

      // Merge the display entities with the template
      const result = mergeDataWithTemplate(displayEntities, template);

      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        message: "Successfully calculated rolling 12-month revenue data",
        resultCount: result.length,
      });

      return result;
    } catch (error) {
      logger.error({
        context: "RevenueStatisticsService.calculateForRollingYear",
        error,
        message: "Error calculating rolling 12-month revenue data",
      });
      throw error;
    }
  }

  /**
   * Fetches revenue data for a custom date range.
   * Uses the repository to fetch data and transforms it into the required format.
   *
   * @param start - Start date in ISO format (YYYY-MM-DD)
   * @param end - End date in ISO format (YYYY-MM-DD)
   * @returns Promise resolving to array of RevenueDisplayEntity objects
   */
  async fetchCustomPeriodRevenueData(
    start: string,
    end: string,
  ): Promise<RevenueDisplayEntity[]> {
    try {
      logger.info({
        context: "RevenueStatisticsService.fetchCustomPeriodRevenueData",
        end,
        message: "Fetching revenue data for custom period",
        start,
      });

      if (!isValidISODate(start) || !isValidISODate(end)) {
        const error = "Invalid date range for revenue query";
        logger.error({
          context: "RevenueStatisticsService.fetchCustomPeriodRevenueData",
          end,
          error,
          start,
        });
        throw new Error(error);
      }

      // Generate all periods we need to fetch
      const periods = generateMonthlyPeriods(start, end);

      logger.info({
        context: "RevenueStatisticsService.fetchCustomPeriodRevenueData",
        message: "Generated monthly periods",
        periodCount: periods.length,
      });

      // Extract start and end periods for repository query
      const startPeriod = periods[0];
      const endPeriod = periods[periods.length - 1];

      if (!startPeriod || !endPeriod) {
        const error = "Failed to generate valid periods for revenue query";
        logger.error({
          context: "RevenueStatisticsService.fetchCustomPeriodRevenueData",
          error,
          periodsGenerated: periods.length,
        });
        throw new Error(error);
      }

      logger.info({
        context: "RevenueStatisticsService.fetchCustomPeriodRevenueData",
        endPeriod,
        message: "Fetching revenue data from repository",
        startPeriod,
      });

      // Use repository to fetch revenue data
      const revenueEntities = await this.repository.findByDateRange(
        startPeriod,
        endPeriod,
      );

      logger.info({
        context: "RevenueStatisticsService.fetchCustomPeriodRevenueData",
        entityCount: revenueEntities.length,
        message: "Retrieved revenue entities from repository",
      });

      // Create a map for quick lookups
      const revenueByPeriod = new Map<string, RevenueEntity>();
      revenueEntities.forEach((entity) => {
        revenueByPeriod.set(entity.period, entity);
      });

      // Transform each period into a result, using actual data or defaults
      const results: RevenueDisplayEntity[] = periods.map((period) => {
        const entity = revenueByPeriod.get(period);

        if (entity) {
          // Transform existing data using the factory method
          return mapRevEntToRevDisplayEnt(entity);
        } else {
          // Create default data for missing periods
          return createDefaultRevenueData(period);
        }
      });

      const periodsWithData = results.filter((r) => r.revenue > 0).length;

      logger.info({
        context: "RevenueStatisticsService.fetchCustomPeriodRevenueData",
        message: "Successfully processed revenue data for custom period",
        periodsWithData,
        totalPeriods: results.length,
      });

      return results;
    } catch (error) {
      logger.error({
        context: "RevenueStatisticsService.fetchCustomPeriodRevenueData",
        end,
        error,
        message: "Error fetching revenue data for custom period",
        start,
      });
      throw error;
    }
  }

  /**
   * Calculates statistical metrics from revenue data for the rolling 12-month period.
   *
   * This is a pure calculation method that doesn't perform database operations directly,
   * but calls `calculateForRollingYear()` to get the underlying data.
   *
   * @returns Promise resolving to RevenueStatistics object
   */
  async calculateStatistics(): Promise<RevenueStatistics> {
    try {
      logger.info({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Calculating revenue statistics",
      });

      // Get the revenue data for the rolling 12-month period
      const revenueData = await this.calculateForRollingYear();

      logger.info({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Retrieved revenue data for statistics calculation",
        revenueDataCount: revenueData.length,
      });

      // If there's no data, return empty statistics
      if (!revenueData || revenueData.length === 0) {
        logger.info({
          context: "RevenueStatisticsService.calculateStatistics",
          message: "No revenue data available, returning empty statistics",
        });
        return createEmptyStatistics();
      }

      // Filter out months with zero revenue for min/max/average calculations
      const nonZeroRevenues = revenueData
        .filter((entity) => entity.revenue > 0)
        .map((entity) => entity.revenue);

      // If there are no non-zero revenues, return empty statistics
      if (nonZeroRevenues.length === 0) {
        logger.info({
          context: "RevenueStatisticsService.calculateStatistics",
          message:
            "No non-zero revenue data available, returning empty statistics",
        });
        return createEmptyStatistics();
      }

      // Calculate statistics
      const maximum = Math.max(...nonZeroRevenues);
      const minimum = Math.min(...nonZeroRevenues);
      const total = revenueData.reduce((sum, value) => sum + value.revenue, 0);
      const average = Math.round(total / nonZeroRevenues.length);

      const statistics: RevenueStatistics = {
        average,
        maximum,
        minimum,
        monthsWithData: nonZeroRevenues.length,
        total,
      };

      logger.info({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Successfully calculated revenue statistics",
        monthsWithData: statistics.monthsWithData,
        totalRevenue: statistics.total,
      });

      return statistics;
    } catch (error) {
      logger.error({
        context: "RevenueStatisticsService.calculateStatistics",
        error,
        message: "Error calculating revenue statistics",
      });
      throw error;
    }
  }
}
