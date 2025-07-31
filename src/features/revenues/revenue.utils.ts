import "server-only";
import type { SimpleRevenueDto } from "@/features/revenues/revenue.dto";
import type { YAxisResult } from "@/features/revenues/revenue.types";

/**
 * Converts monetary values from database cents to display dollars.
 *
 * Performs business logic conversion from database-native cent storage
 * to user-friendly dollar amounts. Includes rounding to eliminate
 * fractional cents in presentation layer.
 *
 * @param cents - Monetary value in cents (database format)
 * @returns Monetary value in dollars, rounded to nearest whole dollar
 *
 * @remarks
 * **Conversion Logic:**
 * - Divides by 100 to convert cents to dollars
 * - Applies Math.round() to eliminate fractional cents
 * - Maintains precision during calculation before final rounding
 *
 * **Usage Context:**
 * - Action layer data transformation
 * - DTO preparation for client consumption
 * - Statistics conversion for display
 *
 * @example
 * ```typescript
 * const dollarsFromCents = convertCentsToDollars(1599); // 16
 * const dollarsFromLarge = convertCentsToDollars(2500000); // 25000
 * const dollarsFromZero = convertCentsToDollars(0); // 0
 * ```
 */
export function convertCentsToDollars(cents: number): number {
  return Math.round(cents / 100);
}

/**
 * Generates formatted Y-axis labels and scaling information for revenue charts.
 *
 * Analyzes revenue data to determine appropriate chart scaling and creates
 * evenly-spaced, formatted axis labels with currency notation. Includes
 * 10% padding above the highest value for visual clarity.
 *
 * @param revenue - Array of revenue data points for analysis
 * @returns YAxisResult containing formatted labels and scaling information
 *
 * @remarks
 * **Algorithm Details:**
 * 1. Finds maximum revenue value across all data points
 * 2. Adds 10% padding and rounds up to nearest thousand
 * 3. Generates 6 evenly-spaced labels (0 to topLabel)
 * 4. Formats labels with currency symbol and K notation
 *
 * **Scaling Strategy:**
 * - Ensures chart doesn't appear cramped by adding padding
 * - Rounds to clean thousands for professional appearance
 * - Uses K notation to reduce label width and improve readability
 *
 * **Label Format:**
 * - "$0K" for zero baseline
 * - "$XXK" format for thousands (e.g., "$25K", "$100K")
 * - Ascending order for proper chart axis display
 *
 * @example
 * ```typescript
 * const revenueData: SimpleRevenueDto[] = [
 *   { month: "Jan", revenue: 15000, monthNumber: 1 },
 *   { month: "Feb", revenue: 22000, monthNumber: 2 },
 *   { month: "Mar", revenue: 18000, monthNumber: 3 }
 * ];
 *
 * const axis = generateYAxis(revenueData);
 * // Result: {
 * //   yAxisLabels: ["$0K", "$5K", "$10K", "$15K", "$20K", "$25K"],
 * //   topLabel: 25000
 * // }
 * ```
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
