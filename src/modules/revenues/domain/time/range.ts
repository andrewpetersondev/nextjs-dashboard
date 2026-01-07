import { addMonths, endOfMonth, getMonth, startOfMonth } from "date-fns";
import {
  type IntervalDuration,
  MONTHS_IN_YEAR,
  ROLLING_START_OFFSET_MONTHS,
  SINGLE_MONTH_INTERVAL,
} from "@/modules/revenues/domain/revenue.constants";
import type { RollingMonthData } from "@/modules/revenues/domain/revenue.types";
import { createMonthTemplateData } from "@/modules/revenues/domain/templates/factory";

/**
 * Calculates a specific month date from rolling start date with offset.
 *
 * @param monthOffset - Offset from start date (0-11)
 * @param startDate - The rolling period start date
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
 * @returns duration - String "year" indicating the period type
 * @returns endDate - Last day of the current month
 * @returns startDate - First day of the month 12 months ago
 *
 */
export function calculateDateRange(): {
  duration: "year";
  endDate: Date;
  startDate: Date;
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
    case "month":
      return SINGLE_MONTH_INTERVAL;
    case "year":
      return MONTHS_IN_YEAR;
    default:
      return MONTHS_IN_YEAR; // Default to 12 months if the period is not recognized
  }
}

/**
 * Creates a month template for a specific index in the rolling period.
 *
 * @param monthIndex - The index of the month in the rolling period (0-11)
 * @param rollingStartDate - The start date of the rolling period
 * @returns RollingMonthData object for the specified month
 */
export function createMonthTemplateFromIndex(
  rollingStartDate: Date,
  monthIndex: number,
): RollingMonthData {
  const calendarMonthIndex = getMonth(
    calculateMonthDateFromStart(rollingStartDate, monthIndex),
  );
  const monthDate = calculateMonthDateFromStart(rollingStartDate, monthIndex);
  return createMonthTemplateData(monthIndex, monthDate, calendarMonthIndex);
}
