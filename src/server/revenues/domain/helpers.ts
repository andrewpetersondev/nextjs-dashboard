import "server-only";

import {
  MAX_MONTH_NUMBER,
  MIN_MONTH_NUMBER,
} from "@/features/revenues/lib/date/constants";
import { MONTH_ORDER, type MonthName } from "@/shared/revenues/types";

export function validateMonthNumber(monthNumber: number, period: Date): void {
  if (monthNumber < MIN_MONTH_NUMBER || monthNumber > MAX_MONTH_NUMBER) {
    throw new Error(`Invalid month number ${monthNumber} in period ${period}`);
  }
}

export function monthAbbreviationFromNumber(monthNumber: number): MonthName {
  const abbr = MONTH_ORDER[monthNumber - 1];
  if (!abbr) {
    throw new Error(
      `Failed to get month abbreviation for month number ${monthNumber}`,
    );
  }
  return abbr;
}
