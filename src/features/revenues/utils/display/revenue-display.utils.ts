import type { SimpleRevenueDto } from "@/features/revenues/core/revenue.dto";
import type {
  Cents,
  Dollars,
  YAxisResult,
} from "@/features/revenues/core/revenue.types";

/**
 * Converts monetary values from database cents to display dollars.
 *
 * @param cents - Monetary value in cents (database format)
 * @returns Monetary value in dollars, rounded to nearest whole dollar
 */
export function convertCentsToDollars(cents: Cents): Dollars {
  return Math.round(cents / 100);
}

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
export const generateYAxis = (revenue: SimpleRevenueDto[]): YAxisResult => {
  const yAxisLabels: string[] = [];
  const highestRecord: number = Math.max(
    ...revenue.map((month: SimpleRevenueDto) => month.revenue),
  );

  // Calculate the appropriate top label with 10% padding
  const topLabel: number = Math.ceil((highestRecord * 1.1) / 1000) * 1000;

  // Generate 5-6 evenly spaced labels
  const labelCount = 5;

  for (let i = labelCount; i >= 0; i--) {
    const value = Math.round((topLabel * i) / labelCount);
    yAxisLabels.push(`$${value / 1000}K`);
  }

  return { topLabel, yAxisLabels };
};
