"use server";

import { getDB } from "@/db/connection";
import type {
  RevenueChartDto,
  RevenueStatisticsDto,
  SimpleRevenueDto,
} from "@/features/revenues/core/revenue.dto";
import type { RevenueActionResult } from "@/features/revenues/core/revenue.types";
import { MONTH_ORDER } from "@/features/revenues/core/revenue.types";
import { RevenueRepository } from "@/features/revenues/repository/revenue.repository";
import { RevenueStatisticsService } from "@/features/revenues/services/statistics/revenue-statistics.service";
import { convertCentsToDollars } from "@/features/revenues/utils/display/revenue-display.utils";
import { logger } from "@/lib/utils/logger";

/**
 * Retrieves complete revenue chart data for the last 12 months with statistical metrics.
 *
 * This server action orchestrates the revenue calculation process by:
 * 1. Instantiating the revenue calculator service with database dependency
 * 2. Fetching raw revenue entities and statistics in parallel
 * 3. Deriving month names from period values (YYYY-MM format)
 * 4. Converting cent values to dollar amounts for presentation
 * 5. Formatting data according to chart requirements
 *
 * @returns Promise resolving to RevenueActionResult containing chart data or error
 *
 * @throws {Error} When database connection fails
 * @throws {Error} When revenue calculation service encounters errors
 * @throws {Error} When data transformation fails
 *
 * @example
 * ```typescript
 * const result = await getRevenueChartAction();
 * if (result.success) {
 *   console.log(`Total revenue: $${result.data.statistics.total}`);
 *   console.log(`Months with data: ${result.data.statistics.monthsWithData}`);
 * } else {
 *   console.error(result.error);
 * }
 * ```
 *
 * @remarks
 * **Architecture Notes:**
 * - Uses dependency injection pattern for database access
 * - Separates business logic (service) from presentation logic (action)
 * - Implements proper error handling with structured logging
 * - Converts raw database values to presentation format
 * - Derives month names from period values using MONTH_ORDER constant
 */
export async function getRevenueChartAction(): Promise<
  RevenueActionResult<RevenueChartDto>
> {
  try {
    // Create repository with database connection
    const revenueRepository = new RevenueRepository(getDB());

    // Create calculator service with repository dependency
    const calculator = new RevenueStatisticsService(revenueRepository);

    // Get pure database values for a rolling 12-month period
    const [entities, rawStatistics] = await Promise.all([
      calculator.calculateForRollingYear(),
      calculator.calculateStatistics(),
    ]);

    const monthlyData: SimpleRevenueDto[] = entities.map((entity, index) => {
      // Extract month number from period (format: YYYY-MM)
      const monthNumber = parseInt(entity.period.substring(5, 7), 10);

      // Validate month number is within valid range (1-12)
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
        revenue: convertCentsToDollars(entity.revenue), // Convert to dollars
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
    logger.error({
      error,
      message: "Get revenue chart action error (rolling 12 months)",
    });
    return { error: "Failed to fetch chart data", success: false };
  }
}
