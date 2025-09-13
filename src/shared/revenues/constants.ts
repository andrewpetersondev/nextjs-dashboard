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
