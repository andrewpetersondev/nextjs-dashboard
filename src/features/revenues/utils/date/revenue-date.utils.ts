/**
 * @file
 * Utility functions for date operations related to revenue calculations.
 *
 * This file contains pure functions for working with dates, periods, and date ranges
 * that are used in revenue calculations. These functions have been extracted from
 * the RevenueCalculatorService to improve code organization and reusability.
 */

import "server-only";

import { ValidationError } from "@/errors/errors";
import type {
  PeriodDuration,
  RollingMonthData,
} from "@/features/revenues/core/revenue.types";
import { createMonthTemplateData } from "@/features/revenues/utils/data/template.utils";

/**
 * Calculates specific month date from rolling start date with offset.
 *
 * @param startDate - The rolling period start date
 * @param monthOffset - Offset from start date (0-11)
 * @returns Date object for the calculated month
 */
export function calculateMonthDateFromStart(
  startDate: Date,
  monthOffset: number,
): Date {
  return new Date(
    startDate.getFullYear(),
    startDate.getMonth() + monthOffset,
    1,
  );
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
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // First day of the month 12 months ago
  const startDate = new Date(currentYear, currentMonth - 11, 1);

  // Last day of the current month
  const endDate = new Date(currentYear, currentMonth + 1, 0);

  return {
    endDate: String(endDate.toISOString().split("T")[0]),
    period: "year",
    startDate: String(startDate.toISOString().split("T")[0]),
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
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

/**
 * Formats the last day of a month as an ISO date string.
 *
 * @param year - Four-digit year
 * @param month - Month number (1-12)
 * @returns ISO date string for the last day of the month
 */
export function formatMonthEndDate(year: number, month: number): string {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

/**
 * Validates if a string is a properly formatted ISO date (YYYY-MM-DD).
 *
 * @param dateString - String to validate as ISO date
 * @returns True if valid ISO date, false otherwise
 */
export function isValidISODate(dateString: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return isoDateRegex.test(dateString) && !Number.isNaN(Date.parse(dateString));
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
  const currentDate = new Date(start);
  const endDate = new Date(end);

  while (currentDate <= endDate) {
    const period = currentDate.toISOString().substring(0, 7); // YYYY-MM format
    periods.push(period);
    currentDate.setMonth(currentDate.getMonth() + 1); // Move to next month
  }

  return periods;
}

/**
 * Formats a Date object to a period string in YYYY-MM format.
 *
 * @param date - Date object to format
 * @returns Formatted period string
 * @throws ValidationError if the date is invalid or not in the correct format
 */
export function formatDateToPeriod(date: Date): string {
  const isoDate = date.toISOString().split("T")[0];
  const formatted = isoDate ? isoDate.substring(0, 7) : "";
  if (!formatted || formatted.length !== 7) {
    throw new ValidationError("Invalid date format for period");
  }
  return formatted;
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
  const calendarMonthIndex = monthDate.getMonth();
  return createMonthTemplateData(monthIndex, monthDate, calendarMonthIndex);
}
