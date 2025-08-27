import { isValid } from "date-fns";
import type { Period } from "@/shared/brands/domain-brands";
import { ValidationError } from "@/shared/errors/domain";
import { dateToPeriod } from "@/shared/revenues/period";

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
