export const CHART_Y_AXIS = {
  currencyPrefix: "$",
  labelCount: 5,
  paddingRatio: 0.1,
  step: 1000,
  thousandsSuffix: "K",
};
export const MIN_MONTH_NUMBER = 1 as const; // January as 1
export const MAX_MONTH_NUMBER = 12 as const; // December as 12
export const MONTHS_IN_YEAR = 12 as const;
export const SINGLE_MONTH_INTERVAL = 1 as const;
// Start offset from "now" to get to the first month of a 12-month rolling window
// Example: with 12 months in the window, the start is current month minus 11 months
export const ROLLING_START_OFFSET_MONTHS = 11 as const;
export const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
// Standardized period durations used in revenue calculations.
export const INTERVAL_DURATIONS = ["year", "month"] as const;
export const MIN_REVENUE_MONTHS = 1;
export const MAX_REVENUE_MONTHS = 12;
export const MAX_REVENUE_YEAR = 2100;
export const MIN_REVENUE_YEAR = 2000;
// Type-safe union of valid month name abbreviations.
export type MonthName = (typeof MONTH_ORDER)[number];
// Type-safe union of valid interval durations.
export type IntervalDuration = (typeof INTERVAL_DURATIONS)[number];
