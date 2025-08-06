import "server-only";

import {
  addMonths,
  endOfMonth,
  format,
  getMonth,
  isValid,
  lastDayOfMonth,
  parseISO,
  startOfMonth,
} from "date-fns";
import { ValidationError } from "@/errors/errors";
import type {
  PeriodDuration,
  RollingMonthData,
} from "@/features/revenues/core/revenue.types";
import { createMonthTemplateData } from "@/features/revenues/utils/data/template.utils";
import { dateToPeriod } from "@/features/revenues/utils/date/period.utils";

/**
 * Calculates specific month date from rolling start date with offset.
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
 * @returns Object containing ISO date strings for the start and end of the period
 * @returns startDate - First day of the month 12 months ago
 * @returns endDate - Last day of the current month
 * @returns period - String "year" indicating the period type
 *
 * @example
 * ```typescript
 * // If current date is 2025-07-31
 * const range = calculateDateRange();
 * // Returns: { startDate: '2024-08-01', endDate: '2025-07-31', period: 'year' }
 * ```
 */
export function calculateDateRange(): {
  endDate: string;
  startDate: string;
  period: string;
} {
  const now = new Date();

  // First day of the month 12 months ago using date-fns
  const startDate = startOfMonth(addMonths(now, -11));

  // Last day of the current month using date-fns
  const endDate = endOfMonth(now);

  return {
    endDate: format(endDate, "yyyy-MM-dd"),
    period: "year",
    startDate: format(startDate, "yyyy-MM-dd"),
  };
}

/**
 * Formats start and end dates for a specific month.
 *
 * @param year - Four-digit year
 * @param month - Month number (1-12)
 * @returns Object containing formatted start and end date strings
 */
export function formatMonthDateRange(
  year: number,
  month: number,
): { startDate: string; endDate: string } {
  const startDate = formatMonthStartDate(year, month);
  const endDate = formatMonthEndDate(year, month);

  return { endDate, startDate };
}

/**
 * Formats the first day of a month as an ISO date string.
 *
 * @param year - Four-digit year
 * @param month - Month number (1-12)
 * @returns ISO date string for the first day of the month
 */
export function formatMonthStartDate(year: number, month: number): string {
  // Adjust month for date-fns (0-11 based)
  const adjustedMonth = month - 1;
  // Create date for first day of month and format it
  const firstDayOfMonth = new Date(year, adjustedMonth, 1);
  return format(firstDayOfMonth, "yyyy-MM-dd");
}

/**
 * Formats the last day of a month as an ISO date string.
 *
 * @param year - Four-digit year
 * @param month - Month number (1-12)
 * @returns ISO date string for the last day of the month
 */
export function formatMonthEndDate(year: number, month: number): string {
  // Adjust month for date-fns (0-11 based)
  const adjustedMonth = month - 1;
  // Create date and get last day of month using date-fns
  const date = new Date(year, adjustedMonth, 1);
  const lastDayDate = lastDayOfMonth(date);
  return format(lastDayDate, "yyyy-MM-dd");
}

/**
 * Validates if a string is a properly formatted ISO date (YYYY-MM-DD).
 *
 * @param dateString - String to validate as ISO date
 * @returns True if valid ISO date, false otherwise
 */
export function isValidISODate(dateString: string): boolean {
  // Check if the string matches the ISO date format (YYYY-MM-DD)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  // Use date-fns to parse and validate the date
  const parsedDate = parseISO(dateString);
  return isValid(parsedDate);
}

/**
 * Generates monthly periods between start and end dates.
 *
 * @param start - Start date in ISO format (YYYY-MM-DD)
 * @param end - End date in ISO format (YYYY-MM-DD)
 * @returns Array of period strings in YYYY-MM format
 */
export function generateMonthlyPeriods(start: string, end: string): string[] {
  const periods: string[] = [];

  // Parse the dates using date-fns
  const startDate = parseISO(start);
  const endDate = parseISO(end);

  // Validate the dates
  if (!isValid(startDate) || !isValid(endDate)) {
    throw new ValidationError("Invalid date format for period generation");
  }

  // Start with the first day of the start month
  let currentDate = startOfMonth(startDate);
  const lastDate = endOfMonth(endDate);

  // Generate periods until we reach or pass the end date
  while (currentDate <= lastDate) {
    periods.push(dateToPeriod(currentDate));
    // Move to the next month using date-fns
    currentDate = addMonths(currentDate, 1);
  }

  return periods;
}

/**
 * Formats a Date object to a period string in YYYY-MM format.
 *
 * @param date - Date object to format
 * @returns Formatted period string
 */
export function formatDateToPeriod(date: Date): string {
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
export function getIntervalCount(period: PeriodDuration): number {
  switch (period) {
    case "year":
      return 12;
    case "month":
      return 1;
    default:
      return 12; // Default to 12 months if period is not recognized
  }
}

/**
 * Generates a template for the rolling period based on start date and period type.
 *
 * @param startDateIso - The start date in ISO format (YYYY-MM-DD)
 * @param duration - The period type ('year' or 'month')
 * @returns Array of RollingMonthData objects for the specified period
 * @throws Error if interval count is invalid or template generation fails
 *
 */
export function generateMonthsTemplate(
  startDateIso: string,
  duration: PeriodDuration,
): RollingMonthData[] {
  const rollingStartDate = new Date(startDateIso);
  const intervalCount = getIntervalCount(duration);

  if (intervalCount <= 0) {
    throw new Error(`Invalid interval count: ${intervalCount}`);
  }

  const template = Array.from({ length: intervalCount }, (_, index) => {
    return createMonthTemplateFromIndex(rollingStartDate, index);
  });

  if (template.length === 0) {
    throw new Error("Failed to generate template: empty array created");
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
