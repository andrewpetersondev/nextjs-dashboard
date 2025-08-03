import "server-only";

import type { RevenueEntity } from "@/db/models/revenue.entity";
import type { RevenueRepositoryInterface } from "@/features/revenues/revenue.repository";
import type {
  MonthlyRevenueQueryResult,
  RevenueStatistics,
  RollingMonthData,
} from "@/features/revenues/revenue.types";
import {
  createDefaultRevenueData,
  createEmptyStatistics,
  createMonthTemplateData,
  mergeDataWithTemplate,
  transformToRevenueEntity,
} from "@/features/revenues/revenue-data.utils";
import {
  calculateDateRange,
  calculateMonthDateFromStart,
  calculateRollingStartDate,
  generateMonthlyPeriods,
  isValidISODate,
} from "@/features/revenues/revenue-date.utils";
import { logger } from "@/lib/utils/logger";

/**
 * Service for calculating revenue statistics.
 *
 * This service provides methods for calculating revenue statistics for different time periods.
 * It uses the repository pattern for data access and utility functions for data transformation.
 *
 * @remarks
 * This service has been extracted from the RevenueCalculatorService to improve separation of concerns.
 * It focuses specifically on statistics calculation and reporting functionality.
 */
export class RevenueStatisticsService {
  /**
   * Constructor using dependency injection pattern.
   *
   * @param repository - Repository instance for revenue data operations
   */
  constructor(private readonly repository: RevenueRepositoryInterface) {}

  /**
   * Calculates revenue data for a rolling 12-month period.
   *
   * Returns complete revenue data for the current month and previous 11 months,
   * filling in zero values for months without invoice data.
   *
   * @returns Promise resolving to array of 12 RevenueEntity objects in chronological order
   *
   * @throws {Error} When template data is missing for any month index
   * @throws {Error} When database query fails or returns no data
   *
   * @example
   * ```typescript
   * const yearlyData = await service.calculateForRollingYear();
   * // Returns 12 months of data, oldest first
   * console.log(yearlyData.length); // 12
   * ```
   */
  async calculateForRollingYear(): Promise<RevenueEntity[]> {
    try {
      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        message: "Starting calculation of rolling 12-month revenue data",
      });

      const { startDate, endDate } = calculateDateRange();

      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        endDate,
        message: "Calculated date range for rolling 12-month period",
        startDate,
      });

      const monthsTemplate: RollingMonthData[] = this.generateMonthsTemplate();

      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        message: "Generated months template",
        monthCount: monthsTemplate.length,
      });

      // Get actual data from invoice table
      const monthlyData = await this.fetchCustomPeriodRevenueData(
        startDate,
        endDate,
      );

      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        message: "Fetched revenue data for custom period",
        monthsWithData: monthlyData.filter((m) => m.revenue > 0).length,
        totalMonths: monthlyData.length,
      });

      // Fill missing months and transform to entities
      const completeData = mergeDataWithTemplate(monthlyData, monthsTemplate);

      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        message: "Merged data with template",
        resultCount: completeData.length,
      });

      const result = completeData.map((data, index) => {
        const template = monthsTemplate[index];
        if (!template) {
          const error = `Template data missing for index ${index}. Expected 12 months of template data.`;
          logger.error({
            context: "RevenueStatisticsService.calculateForRollingYear",
            error,
            index,
          });
          throw new Error(error);
        }
        return transformToRevenueEntity(data, index, template);
      });

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
   * @returns Promise resolving to array of MonthlyRevenueQueryResult objects
   */
  async fetchCustomPeriodRevenueData(
    start: string,
    end: string,
  ): Promise<MonthlyRevenueQueryResult[]> {
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
      const results: MonthlyRevenueQueryResult[] = periods.map((period) => {
        const entity = revenueByPeriod.get(period);

        if (entity) {
          // Transform existing data
          return {
            ...entity,
            month: entity.period.substring(5, 7), // Extract month from period
            monthNumber: parseInt(entity.period.substring(5, 7), 10),
            year: parseInt(entity.period.substring(0, 4), 10), // Extract year from period
          };
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
   * @returns Promise resolving to RevenueStatistics containing calculated metrics
   *
   * @example
   * ```typescript
   * const stats = await service.calculateStatistics();
   * console.log(`Average: ${stats.average}, Total: ${stats.total}`);
   * ```
   */
  async calculateStatistics(): Promise<RevenueStatistics> {
    try {
      logger.info({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Starting calculation of revenue statistics",
      });

      const entities = await this.calculateForRollingYear();

      logger.info({
        context: "RevenueStatisticsService.calculateStatistics",
        entityCount: entities.length,
        message: "Retrieved revenue entities for statistics calculation",
      });

      const revenueValues = entities
        .map((entity) => entity.revenue)
        .filter((revenue) => revenue > 0);

      logger.info({
        context: "RevenueStatisticsService.calculateStatistics",
        message: "Filtered revenue values for statistics calculation",
        nonZeroValueCount: revenueValues.length,
        totalEntityCount: entities.length,
      });

      if (revenueValues.length === 0) {
        logger.info({
          context: "RevenueStatisticsService.calculateStatistics",
          message:
            "No non-zero revenue values found, returning empty statistics",
        });
        return createEmptyStatistics();
      }

      const total = revenueValues.reduce((sum, value) => sum + value, 0);
      const average = Math.round(total / revenueValues.length);
      const maximum = Math.max(...revenueValues);
      const minimum = Math.min(...revenueValues);

      const statistics = {
        average,
        maximum,
        minimum,
        monthsWithData: revenueValues.length,
        total,
      };

      logger.info({
        average,
        context: "RevenueStatisticsService.calculateStatistics",
        maximum,
        message: "Successfully calculated revenue statistics",
        minimum,
        monthsWithData: revenueValues.length,
        total,
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

  /**
   * Generates a template for 12 months with proper chronological ordering.
   *
   * Creates template data for each month in the rolling period, including
   * display order, month names, numbers, and years.
   *
   * @returns Array of 12 RollingMonthData objects in chronological order
   *
   * @internal
   */
  private generateMonthsTemplate(): RollingMonthData[] {
    const rollingStartDate = calculateRollingStartDate();
    const monthIndices = Array.from({ length: 12 }, (_, index) => index);

    return monthIndices.map((monthIndex) =>
      this.createMonthTemplateFromIndex(rollingStartDate, monthIndex),
    );
  }

  /**
   * Creates month template data from a rolling start date and month index.
   *
   * @param rollingStartDate - The starting date for the 12-month period
   * @param monthIndex - Zero-based index within the 12-month sequence (0-11)
   * @returns RollingMonthData object for the specified month
   *
   * @internal
   */
  private createMonthTemplateFromIndex(
    rollingStartDate: Date,
    monthIndex: number,
  ): RollingMonthData {
    const monthDate = calculateMonthDateFromStart(rollingStartDate, monthIndex);
    const calendarMonthIndex = monthDate.getMonth();

    return createMonthTemplateData(monthIndex, monthDate, calendarMonthIndex);
  }
}
