import "server-only";
import {
  MAX_MONTH_NUMBER,
  MIN_MONTH_NUMBER,
  MONTH_ORDER,
  type MonthName,
} from "@/modules/revenues/domain/constants";
import { makeValidationError } from "@/shared/errors/factories/app-error.factory";

export function validateMonthNumber(monthNumber: number, period: Date): void {
  if (monthNumber < MIN_MONTH_NUMBER || monthNumber > MAX_MONTH_NUMBER) {
    throw makeValidationError({
      message: `Invalid month number ${monthNumber} in period ${period}`,
    });
  }
}

export function monthAbbreviationFromNumber(monthNumber: number): MonthName {
  const abbr = MONTH_ORDER[monthNumber - 1];
  if (!abbr) {
    throw makeValidationError({
      message: `Failed to get month abbreviation for month number ${monthNumber}`,
    });
  }
  return abbr;
}
