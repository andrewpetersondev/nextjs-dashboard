import "server-only";

import { MONTH_ORDER } from "@/shared/revenues/constants";
import {
  MAX_MONTH_NUMBER,
  MIN_MONTH_NUMBER,
} from "@/shared/revenues/revenues-date.constants";
import type { MonthName } from "@/shared/revenues/types";

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
