import { addMonths, endOfMonth, getMonth, startOfMonth } from "date-fns";
import { createMonthTemplateData } from "@/features/revenues/lib/template";
import type { RollingMonthData } from "@/features/revenues/types";
import {
  MONTHS_IN_YEAR,
  ROLLING_START_OFFSET_MONTHS,
  SINGLE_MONTH_INTERVAL,
} from "@/shared/constants/revenues-date";
import type { IntervalDuration } from "@/shared/revenues/types";

/**
 * Calculates a specific month date from rolling start date with offset.
 *
 * @param startDate - The rolling period start date
 * @param monthOffset - Offset from start date (0-11)
 */
export function calculateMonthDateFromStart(
  startDate: Date,
  monthOffset: number,
): Date {
  // Use date-fns to add months and get the first day of the month
  return startOfMonth(addMonths(startDate, monthOffset));
}

/**
 * Calculates the date range for the rolling 12-month period.
 *
 * @returns startDate - First day of the month 12 months ago
 * @returns endDate - Last day of the current month
 * @returns duration - String "year" indicating the period type
 *
 */
export function calculateDateRange(): {
  endDate: Date;
  startDate: Date;
  duration: "year";
} {
  const now = new Date();

  // First day of the month 12 months ago using date-fns
  const startDate = startOfMonth(addMonths(now, -ROLLING_START_OFFSET_MONTHS));

  // Last day of the current month using date-fns
  const endDate = endOfMonth(now);

  return {
    duration: "year",
    endDate,
    startDate,
  };
}

/**
 * Returns the number of intervals based on the period type.
 *
 * @param period - The period type ('year' or 'month')
 * @returns The number of intervals to generate
 */
export function getIntervalCount(period: IntervalDuration): number {
  switch (period) {
    case "year":
      return MONTHS_IN_YEAR;
    case "month":
      return SINGLE_MONTH_INTERVAL;
    default:
      return MONTHS_IN_YEAR; // Default to 12 months if the period is not recognized
  }
}

/**
 * Creates a month template for a specific index in the rolling period.
 *
 * @param rollingStartDate - The start date of the rolling period
 * @param monthIndex - The index of the month in the rolling period (0-11)
 * @returns RollingMonthData object for the specified month
 */
export function createMonthTemplateFromIndex(
  rollingStartDate: Date,
  monthIndex: number,
): RollingMonthData {
  const monthDate = calculateMonthDateFromStart(rollingStartDate, monthIndex);
  const calendarMonthIndex = getMonth(monthDate);
  return createMonthTemplateData(monthIndex, monthDate, calendarMonthIndex);
}
