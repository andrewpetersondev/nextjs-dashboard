// Centralized date-related constants for the Revenues domain
// This helps eliminate magic numbers and clarifies intent across date utilities.

export const MIN_MONTH_NUMBER = 1 as const; // January as 1
export const MAX_MONTH_NUMBER = 12 as const; // December as 12

export const MONTHS_IN_YEAR = 12 as const;
export const SINGLE_MONTH_INTERVAL = 1 as const;

// Rolling window for revenues charts/data (last 12 months including current)
export const ROLLING_WINDOW_MONTHS = 12 as const;
// Start offset from "now" to get to the first month of a 12-month rolling window
// Example: with 12 months in the window, the start is current month minus 11 months
export const ROLLING_START_OFFSET_MONTHS = 11 as const;
