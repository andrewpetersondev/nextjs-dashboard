import type { Dollars } from "@/shared/money/money";

// Standardized sources of revenue data.
export const REVENUE_SOURCES = [
  "seed",
  "handler",
  "invoice_event",
  "rolling_calculation",
  "template",
] as const;

// Type-safe union of valid revenue sources.
export type RevenueSource = (typeof REVENUE_SOURCES)[number];

/**
 * Chart axis data for revenue charts.
 * @prop yAxisLabels - Array of formatted Y-axis labels in ascending order
 * @prop topLabel - Maximum chart value in dollars for scaling purposes
 */
export interface YAxisResult {
  readonly yAxisLabels: readonly string[];
  readonly topLabel: Dollars;
}
