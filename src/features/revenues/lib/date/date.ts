import { ValidationError } from "@/errors/errors";
import { MONTH_ORDER, type MonthName } from "@/features/revenues/core/types";

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
