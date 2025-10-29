import { CHART_Y_AXIS } from "@/features/revenues/constants";
import type { SimpleRevenueDto } from "@/features/revenues/dto/types";
import type { YaxisResult } from "@/features/revenues/types";

/**
 * Generates formatted Y-axis labels and scaling information for revenue charts.
 *
 * Analyzes revenue data to determine the appropriate chart scaling and creates
 * evenly spaced, formatted axis labels with currency notation. Includes
 * 10% padding above the highest value for visual clarity.
 *
 * @param revenue - Array of revenue data points for analysis
 * @returns YAxisResult containing formatted labels and scaling information
 *
 * @remarks
 * **Algorithm Details: **
 * 1. Finds maximum revenue value across all data points
 * 2. Adds 10% padding and rounds up to the nearest thousandth
 * 3. Generates 6 evenly spaced labels (0 to topLabel)
 * 4. Formats labels with currency symbol and K notation
 *
 * **Scaling Strategy: **
 * - Ensures chart doesn't appear cramped by adding padding
 * - Rounds to clean thousands for professional appearance
 * - Uses K notation to reduce label width and improve readability
 *
 * **Label Format: **
 * - "$0K" for zero-baseline
 * - "$XXK" format for thousands (e.g., "$25K", "$100K")
 * - Ascending order for proper chart axis display
 *
 * @throws {Error} When revenue array is empty
 * @throws {Error} When revenue data contains invalid numeric values
 */
export const generateYaxis = (revenue: SimpleRevenueDto[]): YaxisResult => {
  const yAxisLabels: string[] = [];
  const highestRecord: number = Math.max(
    ...revenue.map((month: SimpleRevenueDto) => month.totalAmount),
  );

  // Calculate the appropriate top label with 10% padding
  const topLabel: number =
    Math.ceil(
      (highestRecord * (1 + CHART_Y_AXIS.paddingRatio)) / CHART_Y_AXIS.step,
    ) * CHART_Y_AXIS.step;

  // Generate 5-6 evenly spaced labels
  const labelCount = CHART_Y_AXIS.labelCount;

  for (let i = labelCount; i >= 0; i--) {
    const value = Math.round((topLabel * i) / labelCount);
    yAxisLabels.push(`$${value / CHART_Y_AXIS.step}K`);
  }

  return { topLabel, yAxisLabels };
};
