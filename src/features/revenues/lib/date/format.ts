import { isValid } from "date-fns";
import { dateToPeriod } from "@/features/revenues/lib/date/period";
import type { Period } from "@/shared/brands/domain-brands";
import { ValidationError } from "@/shared/errors/domain";

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
