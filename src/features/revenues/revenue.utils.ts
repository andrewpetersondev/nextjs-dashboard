import "server-only";
import type {
  RevenueStatisticsDto,
  SimpleRevenueDto,
} from "@/features/revenues/revenue.dto";
import type {
  StatisticsLine,
  YAxisResult,
  YAxisWithStatistics,
} from "@/features/revenues/revenue.types";

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

/**
 * Generate Y-axis with statistics overlay lines
 */
export function generateYAxisWithStatistics(
  revenue: SimpleRevenueDto[],
  statistics: RevenueStatisticsDto,
): YAxisWithStatistics {
  const revenueArray = revenue.map((month) => month.revenue);
  const maxRevenue = Math.max(...revenueArray);

  // Calculate nice round number for top of chart
  const topLabel = Math.ceil((maxRevenue * 1.1) / 1000) * 1000;

  // Generate Y-axis labels
  const labelCount = 5;
  const yAxisLabels = [];
  for (let i = labelCount; i >= 0; i--) {
    const value = Math.round((topLabel * i) / labelCount);
    yAxisLabels.push(`$${value.toLocaleString()}`);
  }

  // Generate statistics lines
  const statisticsLines: StatisticsLine[] = [];

  if (statistics.maximum > 0) {
    statisticsLines.push({
      className: "border-red-400 border-dashed",
      label: "Max",
      value: statistics.maximum,
    });
  }

  if (statistics.average > 0) {
    statisticsLines.push({
      className: "border-blue-400 border-dotted",
      label: "Avg",
      value: statistics.average,
    });
  }

  if (statistics.minimum > 0) {
    statisticsLines.push({
      className: "border-green-400 border-dashed",
      label: "Min",
      value: statistics.minimum,
    });
  }

  return {
    statisticsLines,
    topLabel,
    yAxisLabels,
  };
}
