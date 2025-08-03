"use server";

import { getDB } from "@/db/connection";
import type { RevenueChartDto } from "@/features/revenues/revenue.dto";
import type { RevenueActionResult } from "@/features/revenues/revenue.types";
import { convertCentsToDollars } from "@/features/revenues/revenue.utils";
import { RevenueCalculatorService } from "@/features/revenues/revenue-calculator.service";
import { logger } from "@/lib/utils/logger";

/**
 * Retrieves complete revenue chart data for the last 12 months with statistical metrics.
 *
 * This server action orchestrates the revenue calculation process by:
 * 1. Instantiating the revenue calculator service with database dependency
 * 2. Fetching raw revenue entities and statistics in parallel
 * 3. Converting cent values to dollar amounts for presentation
 * 4. Formatting data according to chart requirements
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
 * Converts raw database values to presentation format
 */
export async function getRevenueChartAction(): Promise<
  RevenueActionResult<RevenueChartDto>
> {
  try {
    const calculator = new RevenueCalculatorService(getDB());

    // Get pure database values for a rolling 12-month period
    const [entities, rawStatistics] = await Promise.all([
      calculator.calculateForRollingYear(),
      calculator.calculateStatistics(),
    ]);

    // Apply business logic conversions in the action layer
    const chartData: RevenueChartDto = {
      monthlyData: entities.map((entity, index) => ({
        month: entity.month,
        monthNumber: index + 1, // 1-12 for scrolling logic (chronological order)
        revenue: convertCentsToDollars(entity.revenue), // Convert to dollars
      })),
      statistics: {
        average: convertCentsToDollars(rawStatistics.average),
        maximum: convertCentsToDollars(rawStatistics.maximum),
        minimum: convertCentsToDollars(rawStatistics.minimum),
        monthsWithData: rawStatistics.monthsWithData,
        total: convertCentsToDollars(rawStatistics.total),
      },
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
