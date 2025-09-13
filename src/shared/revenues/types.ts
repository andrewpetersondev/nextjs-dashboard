import type {
  INTERVAL_DURATIONS,
  MONTH_ORDER,
} from "@/shared/revenues/constants";

// Type-safe union of valid month name abbreviations.
export type MonthName = (typeof MONTH_ORDER)[number];

// Type-safe union of valid interval durations.
export type IntervalDuration = (typeof INTERVAL_DURATIONS)[number];
