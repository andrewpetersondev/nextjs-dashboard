import "server-only";

/**
 * Utility functions for date operations related to revenue calculations.
 *
 * This file contains pure functions for working with dates, periods, and date ranges
 * that are used in revenue calculations. These functions have been extracted from
 * the RevenueCalculatorService to improve code organization and reusability.
 */

/**
 * Calculates the starting date for the 12-month rolling period.
 *
 * @returns Date object representing first day of month 12 months ago
 */
export function calculateRollingStartDate(): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  return new Date(currentYear, currentMonth - 11, 1);
}

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
 *
 * @example
 * ```typescript
 * // If current date is 2025-07-31
 * const range = calculateDateRange();
 * // Returns: { startDate: '2024-08-01', endDate: '2025-07-31' }
 * ```
 */
export function calculateDateRange(): { endDate: string; startDate: string } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // First day of the month 12 months ago
  const startDate = new Date(currentYear, currentMonth - 11, 1);

  // Last day of the current month
  const endDate = new Date(currentYear, currentMonth + 1, 0);

  return {
    endDate: String(endDate.toISOString().split("T")[0]),
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
