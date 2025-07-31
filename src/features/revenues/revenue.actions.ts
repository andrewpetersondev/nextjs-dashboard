"use server";

import { getDB } from "@/db/connection";
import type { SimpleRevenueDto } from "@/features/revenues/revenue.dto";
import type { RevenueActionResult } from "@/features/revenues/revenue.types";
import {
  convertCentsToDollars,
  getCurrentYear,
} from "@/features/revenues/revenue.utils";
import { RevenueCalculatorService } from "@/features/revenues/revenue-calculator.service";
import { logger } from "@/lib/utils/logger";

/**
 * Get simplified revenue data for charts
 * Applies business logic conversions after pure database operations
 */
export async function getRevenueChartAction(
  year?: number,
): Promise<RevenueActionResult<SimpleRevenueDto[]>> {
  try {
    const targetYear = year ?? getCurrentYear();
    const calculator = new RevenueCalculatorService(getDB());

    // Get pure database values
    const revenue = await calculator.calculateForYear(targetYear);

    // Apply business logic conversion in the action layer
    const chartData: SimpleRevenueDto[] = revenue.map((entity) => ({
      month: entity.month,
      // Convert cents to dollars for chart display
      revenue: convertCentsToDollars(entity.revenue),
    }));

    // Debug logging with both raw and converted values
    console.log("Revenue conversion debug:", {
      maxConvertedRevenue: Math.max(...chartData.map((d) => d.revenue)),
      sampleConversions: revenue.slice(0, 3).map((r) => ({
        convertedDollars: convertCentsToDollars(r.revenue),
        month: r.month,
        rawCents: r.revenue,
      })),
      totalMonths: chartData.length,
    });

    return { data: chartData, success: true };
  } catch (error) {
    logger.error({
      error,
      message: "Get revenue chart action error",
      year,
    });
    return { error: "Failed to fetch chart data", success: false };
  }
}
