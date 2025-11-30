import { isValid } from "date-fns";
import { AppError } from "@/shared/errors/app-error";

/**
 * Normalizes a Date to the first day of its month in UTC.
 * Throws ValidationError if the provided date is invalid.
 */
export function toFirstDayOfMonthUtc(date: Date): Date {
  if (!isValid(date)) {
    throw new AppError("validation", { message: "Invalid Date" });
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/**
 * Converts a date to the first day of the same month.
 * @param date - The input date
 * @returns A new Date object representing the first day of the month
 */
export function toFirstDayOfMonthLocal(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
