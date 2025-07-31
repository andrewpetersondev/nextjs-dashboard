"use server";

import { getDB } from "@/db/connection";
import type { RevenueChartDto } from "@/features/revenues/revenue.dto";
import type { RevenueActionResult } from "@/features/revenues/revenue.types";
import { convertCentsToDollars } from "@/features/revenues/revenue.utils";
import { RevenueCalculatorService } from "@/features/revenues/revenue-calculator.service";
import { logger } from "@/lib/utils/logger";

/**
 * Get complete revenue chart data for the last 12 months with statistics
 * Converts raw database values to presentation format
 */
export async function getRevenueChartAction(): Promise<
  RevenueActionResult<RevenueChartDto>
> {
  try {
    const calculator = new RevenueCalculatorService(getDB());

    // Get pure database values for rolling 12-month period
    const [entities, rawStatistics] = await Promise.all([
      calculator.calculateForYear(),
      calculator.calculateStatistics(),
    ]);

    // Apply business logic conversions in action layer
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
