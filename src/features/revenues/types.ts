/**
 * Money unit aliases to make dollars vs cents explicit at type level.
 * These are plain number aliases (non-branded) to keep the refactor minimal
 * while still documenting intent throughout the codebase.
 */
export type Cents = number;
export type Dollars = number;

// Standardized period durations used in revenue calculations.
export const INTERVAL_DURATIONS = ["year", "month"] as const;

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
