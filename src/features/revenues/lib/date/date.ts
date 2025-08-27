import {
  MAX_MONTH_NUMBER,
  MIN_MONTH_NUMBER,
} from "@/features/revenues/lib/date/constants";
import { ValidationError_New } from "@/shared/errors/domain";
import { MONTH_ORDER, type MonthName } from "@/shared/revenues/types";

/**
 * Safely convert a calendar month number (1-12) to a MonthName.
 *
 * @param monthNumber - The month number (1-12)
 * @returns The corresponding month name
 * @throws {ValidationError} When monthNumber is not between 1 and 12
 */
export function getMonthName(monthNumber: number): MonthName {
  if (
    !Number.isInteger(monthNumber) ||
    monthNumber < MIN_MONTH_NUMBER ||
    monthNumber > MAX_MONTH_NUMBER
  ) {
    throw new ValidationError_New(
      `Invalid month number: ${monthNumber}. Expected an integer between 1 and 12.`,
    );
  }

  const index = monthNumber - MIN_MONTH_NUMBER; // convert to 0-based index
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
    throw new ValidationError_New(
      `Invalid month name: "${monthName}". Expected one of: ${MONTH_ORDER.join(", ")}`,
    );
  }
  return index + MIN_MONTH_NUMBER;
}
