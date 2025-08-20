import {
  addMonths,
  endOfMonth,
  getMonth,
  isValid,
  startOfMonth,
} from "date-fns";
import type { Period } from "@/core/types/types.brands";
import { ValidationError } from "@/errors/errors";
import {
  type IntervalDuration,
  MONTH_ORDER,
  type MonthName,
  type RollingMonthData,
} from "@/features/revenues/core/revenue.types";
import { createMonthTemplateData } from "@/features/revenues/utils/data/template.utils";
import { dateToPeriod } from "@/features/revenues/utils/date/period.utils";

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
  const startDate = startOfMonth(addMonths(now, -11));

  // Last day of the current month using date-fns
  const endDate = endOfMonth(now);

  return {
    duration: "year",
    endDate: endDate,
    startDate: startDate,
  };
}

/**
 * Generates monthly periods between start and end dates.
 *
 * @param start
 * @param end
 * @returns Array of branded Period values (first-of-month Date)
 */
export function generateMonthlyPeriods(start: Date, end: Date): Period[] {
  const periods: Period[] = [];

  // Start with the first day of the start month
  let currentDate = startOfMonth(start);
  const lastDate = endOfMonth(end);

  // Generate periods until we reach or pass the end date
  while (currentDate <= lastDate) {
    periods.push(dateToPeriod(currentDate));
    // Move to the next month using date-fns
    currentDate = addMonths(currentDate, 1);
  }

  return periods;
}

/**
 * Formats a Date object to a branded Period (first-of-month Date).
 *
 * @param date - Date object to format
 * @returns Formatted period string
 */
export function formatDateToPeriod(date: Date): Period {
  if (!isValid(date)) {
    throw new ValidationError("Invalid date for period formatting");
  }
  return dateToPeriod(date);
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
      return 12;
    case "month":
      return 1;
    default:
      return 12; // Default to 12 months if the period is not recognized
  }
}

/**
 * Generates a template for the rolling period based on the start date and period type.
 *
 * @param startDate - The start date
 * @param duration - The period type ('year' or 'month')
 * @returns Array of RollingMonthData objects for the specified period
 * @throws Error if interval count is invalid or template generation fails
 *
 */
export function generateMonthsTemplate(
  startDate: Date,
  duration: IntervalDuration,
): RollingMonthData[] {
  const intervalCount = getIntervalCount(duration);

  if (intervalCount <= 0) {
    throw new Error(`Invalid interval count: ${intervalCount}`);
  }

  const template = Array.from({ length: intervalCount }, (_, index) => {
    return createMonthTemplateFromIndex(startDate, index);
  });

  if (template.length === 0) {
    throw new Error("Failed to generate a template: an empty array created");
  }

  return template;
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

/**
 * Safely convert a calendar month number (1-12) to a MonthName.
 *
 * @param monthNumber - The month number (1-12)
 * @returns The corresponding month name
 * @throws {ValidationError} When monthNumber is not between 1 and 12
 */
export function getMonthName(monthNumber: number): MonthName {
  if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
    throw new ValidationError(
      `Invalid month number: ${monthNumber}. Expected an integer between 1 and 12.`,
    );
  }

  const index = monthNumber - 1;
  // biome-ignore lint/style/noNonNullAssertion: <Safe due to validation above>
  return MONTH_ORDER[index]!;
}

/**
 * Get the month number (1-12) from a MonthName.
 *
 * @param monthName - The month name abbreviation
 * @returns The corresponding month number (1-12)
 * @throws {ValidationError} When monthName is not a valid MonthName
 */
export function getMonthNumber(monthName: MonthName): number {
  const index = MONTH_ORDER.indexOf(monthName);
  if (index === -1) {
    throw new ValidationError(
      `Invalid month name: "${monthName}". Expected one of: ${MONTH_ORDER.join(", ")}`,
    );
  }
  return index + 1;
}
