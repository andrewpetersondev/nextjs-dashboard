import "server-only";

import {
  MAX_MONTH_NUMBER,
  MIN_MONTH_NUMBER,
  MONTH_ORDER,
  type MonthName,
} from "@/modules/revenues/domain/revenue.constants";
import { APP_ERROR_KEYS } from "@/shared/core/errors/catalog/app-error.registry";
import { makeAppError } from "@/shared/core/errors/factories/app-error.factory";

export function monthAbbreviationFromNumber(monthNumber: number): MonthName {
  const abbr = MONTH_ORDER[monthNumber - 1];
  if (!abbr) {
    throw makeAppError(APP_ERROR_KEYS.validation, {
      cause: "",
      message: `Failed to get month abbreviation for month number ${monthNumber}`,
      metadata: {},
    });
  }
  return abbr;
}

export function validateMonthNumber(monthNumber: number, period: Date): void {
  if (monthNumber < MIN_MONTH_NUMBER || monthNumber > MAX_MONTH_NUMBER) {
    throw makeAppError(APP_ERROR_KEYS.validation, {
      cause: "",
      message: `Invalid month number ${monthNumber} in period ${period}`,
      metadata: {},
    });
  }
}
