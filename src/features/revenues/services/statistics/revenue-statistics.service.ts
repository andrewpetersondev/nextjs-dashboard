import "server-only";

import type {
  RevenueDisplayEntity,
  RevenueEntity,
} from "@/features/revenues/core/revenue.entity";
import { mapRevEntToRevDisplayEnt } from "@/features/revenues/core/revenue.mapper";
import type {
  RevenueStatistics,
  RollingMonthData,
} from "@/features/revenues/core/revenue.types";
import type { RevenueRepositoryInterface } from "@/features/revenues/repository/revenue.repository.interface";
import {
  createEmptyStatistics,
  mergeDataWithTemplate,
} from "@/features/revenues/utils/data/revenue-data.utils";
import {
  rollingMonthToPeriod,
  toPeriod,
} from "@/features/revenues/utils/date/period.utils";
import {
  calculateDateRange,
  generateMonthsTemplate,
} from "@/features/revenues/utils/date/revenue-date.utils";
import { type Period, toIntervalDuration } from "@/lib/definitions/brands";
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
   * Ensures all months in the period have data entries, even if no revenue exists.
   *
   * @returns Promise resolving to an array of RevenueDisplayEntity objects
   */
  async calculateForRollingYear(): Promise<RevenueDisplayEntity[]> {
    try {
      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        message: "Calculating rolling 12-month revenue data",
      });

      // Calculate the date range for the rolling 12-month period.
      // TODO: period should be renamed to interval so it does not get confused with DB Schema?
      const { startDate, endDate, period } = calculateDateRange();

      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        endDate,
        message: "Calculated date range for a rolling 12-month period",
        period,
        startDate,
      });

      // Generate the template for the 12-month period
      // TODO: rename period to interval?
      const template = generateMonthsTemplate(
        startDate,
        toIntervalDuration(period),
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

      const startPeriod = rollingMonthToPeriod(firstMonth);
      const endPeriod = rollingMonthToPeriod(lastMonth);

      logger.info({
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
      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        entityCount: revenueEntities.length,
        message: "Fetched revenue data from repository",
      });

      // Transform the revenue entities to display entities
      const displayEntities: RevenueDisplayEntity[] = revenueEntities.map(
        (entity: RevenueEntity): RevenueDisplayEntity =>
          mapRevEntToRevDisplayEnt(entity),
      );

      logger.info({
        context: "RevenueStatisticsService.calculateForRollingYear",
        displayEntities,
        displayEntityCount: displayEntities.length,
        message: "Transformed revenue entities to display entities",
      });

      try {
        // Build a merge-ready template with a period added
        const mergeReadyTemplate = template.map((m) => ({
          ...m,
          period: rollingMonthToPeriod(m), // yields 'YYYY-MM' (branded Period)
        }));

        // Merge the display entities with the template
        const result: RevenueDisplayEntity[] = mergeDataWithTemplate(
          displayEntities,
          mergeReadyTemplate,
        );
        logger.info({
          context: "RevenueStatisticsService.calculateForRollingYear",
          message: "Successfully calculated rolling 12-month revenue data",
          result,
          resultCount: result.length,
          withDataCount: displayEntities.length,
        });
        return result;
      } catch (e) {
        // Minimal, targeted diagnostics to locate data issues
        const periods: Period[] = displayEntities.map(
          (d: RevenueDisplayEntity): Period => d.period,
        );

        // Properly format template periods as YYYY-MM with zero-padded month
        const templatePeriods: Period[] = template.map((m: RollingMonthData) =>
          toPeriod(`${m.year}-${String(m.month).padStart(2, "0")}`),
        );

        const duplicates: Period[] = [
          ...new Set(periods.filter((p, i) => periods.indexOf(p) !== i)),
        ];
        const missing = templatePeriods.filter((p) => !periods.includes(p));
        const unexpected = periods.filter((p) => !templatePeriods.includes(p));
        const invalidFormat = periods.filter((p) => !/^\d{4}-\d{2}$/.test(p));
        const badRevenue = displayEntities
          .filter(
            (d) => typeof d.revenue !== "number" || Number.isNaN(d.revenue),
          )
          .map((d) => d.period);

        logger.error({
          context: "RevenueStatisticsService.calculateForRollingYear",
          error: e,
          message: "Merge validation failed",
          stats: {
            badRevenue,
            displayCount: displayEntities.length,
            duplicates,
            invalidFormat,
            missing,
            periods,
            templateCount: template.length,
            templatePeriods,
            unexpected,
          },
        });
        throw e;
      }
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
   * Calculates statistical metrics from revenue data for the rolling 12-month period.
   *
   * This is a pure calculation method that doesn't perform database operations directly
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

      // Filter out months with zero revenues for min/max/average calculations
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
