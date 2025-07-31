import "server-only";
import type { SimpleRevenueDto } from "@/features/revenues/revenue.dto";
import type { YAxisResult } from "@/features/revenues/revenue.types";

/**
 * Converts cents to dollars for display purposes
 * Business logic conversion separate from database operations
 */
export function convertCentsToDollars(cents: number): number {
  return Math.round(cents / 100);
}

export const generateYAxis = (revenue: SimpleRevenueDto[]): YAxisResult => {
  const yAxisLabels: string[] = [];
  const highestRecord: number = Math.max(
    ...revenue.map((month: SimpleRevenueDto) => month.revenue),
  );

  // Calculate appropriate top label with 10% padding
  const topLabel: number = Math.ceil((highestRecord * 1.1) / 1000) * 1000;

  // Generate 5-6 evenly spaced labels
  const labelCount = 5;

  for (let i = labelCount; i >= 0; i--) {
    const value = Math.round((topLabel * i) / labelCount);
    yAxisLabels.push(`$${value / 1000}K`);
  }

  return { topLabel, yAxisLabels };
};
