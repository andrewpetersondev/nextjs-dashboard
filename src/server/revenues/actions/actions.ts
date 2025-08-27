"use server";

import { getDB } from "@/server/db/connection";
import { serverLogger } from "@/server/logging/serverLogger";
import type {
  RevenueChartDto,
  RevenueStatisticsDto,
} from "@/server/revenues/dto";
import { RevenueRepository } from "@/server/revenues/repository";
import { RevenueStatisticsService } from "@/server/revenues/services/revenue-statistics.service";
import type { RevenueActionResult } from "@/server/revenues/types";
import { convertCentsToDollars } from "@/shared/money/convert";
import { MONTH_ORDER, type SimpleRevenueDto } from "@/shared/revenues/types";

/**
 * Retrieves complete revenue chart data for the last 12 months with statistical metrics.
 *
 * @returns Promise resolving to RevenueActionResult containing chart data or error
 *
 * @throws {Error} When database connection fails
 * @throws {Error} When revenue calculation service encounters errors
 * @throws {Error} When data transformation fails
 *
 */
export async function getRevenueChartAction(): Promise<
  RevenueActionResult<RevenueChartDto>
> {
  try {
    // Create repository with database connection
    const revenueRepository = new RevenueRepository(getDB());

    // Create a calculator service with repository dependency
    const calculator = new RevenueStatisticsService(revenueRepository);

    // Get pure database values for a rolling 12-month period
    const [entities, rawStatistics] = await Promise.all([
      calculator.calculateForRollingYear(),
      calculator.calculateStatistics(),
    ]);

    const monthlyData: SimpleRevenueDto[] = entities.map((entity, index) => {
      // Extract the month number from Period value (1-12)
      const monthNumber = entity.period.getUTCMonth() + 1;

      // Validate month number is within the valid range (1-12)
      if (monthNumber < 1 || monthNumber > 12) {
        throw new Error(
          `Invalid month number ${monthNumber} in period ${entity.period}`,
        );
      }

      // Get month abbreviation from MONTH_ORDER array (0-indexed, so subtract 1)
      const monthAbbreviation = MONTH_ORDER[monthNumber - 1];

      // Additional safety check to ensure we have a valid month name
      if (!monthAbbreviation) {
        throw new Error(
          `Failed to get month abbreviation for month number ${monthNumber}`,
        );
      }

      return {
        month: monthAbbreviation,
        monthNumber: index + 1, // 1-12 for scrolling logic (chronological order)
        totalAmount: convertCentsToDollars(entity.totalAmount), // Convert to dollars
      };
    });

    const statistics: RevenueStatisticsDto = {
      average: convertCentsToDollars(rawStatistics.average),
      maximum: convertCentsToDollars(rawStatistics.maximum),
      minimum: convertCentsToDollars(rawStatistics.minimum),
      monthsWithData: rawStatistics.monthsWithData,
      total: convertCentsToDollars(rawStatistics.total),
    };

    // Apply business logic conversions in the action layer
    const chartData: RevenueChartDto = {
      monthlyData,
      statistics,
      year: new Date().getFullYear(), // Current year for display
    };

    return { data: chartData, success: true };
  } catch (error) {
    serverLogger.error({
      error,
      message: "Get revenue chart action error (rolling 12 months)",
    });
    return { error: "Failed to fetch chart data", success: false };
  }
}
