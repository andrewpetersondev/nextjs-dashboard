import { format, isValid, parse } from "date-fns";
import { Err, Ok } from "@/shared/application/result/result";
import type { Result } from "@/shared/application/result/result.types";
import { createBrand } from "@/shared/branding/brand";
import { PERIOD_BRAND, type Period } from "@/shared/branding/brands";
import { AppError } from "@/shared/infrastructure/errors/core/app-error.class";

/**
 * Normalizes a Date to the first day of its month in UTC.
 * Throws ValidationError if the provided date is invalid.
 */
function toFirstDayOfMonthUtc(date: Date): Date {
  if (!isValid(date)) {
    throw new AppError("validation", { message: "Invalid Date" });
  }
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/**
 * Validates a period value and normalizes it to the first day of the month in UTC.
 * Accepts Date instances, "yyyy-MM" strings, or "yyyy-MM-dd" strings (where day must be 01).
 *
 * @param value - The value to validate (Date, "yyyy-MM", or "yyyy-MM-01")
 * @returns A Result containing the normalized Date or an AppError
 */
const validatePeriod = (value: unknown): Result<Date, AppError> => {
  if (value instanceof Date) {
    if (!isValid(value)) {
      return Err(
        new AppError("validation", {
          message: "Invalid period: Date instance is not valid",
        }),
      );
    }
    return Ok(toFirstDayOfMonthUtc(value));
  }

  if (typeof value === "string") {
    const parsedMonth = parse(value, "yyyy-MM", new Date());
    if (isValid(parsedMonth) && format(parsedMonth, "yyyy-MM") === value) {
      return Ok(toFirstDayOfMonthUtc(parsedMonth));
    }

    const parsedDay = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(parsedDay) && format(parsedDay, "yyyy-MM-dd") === value) {
      if (parsedDay.getUTCDate() !== 1) {
        return Err(
          new AppError("validation", {
            message: `Invalid period: date must be the first day of the month, got "${value}"`,
          }),
        );
      }
      return Ok(toFirstDayOfMonthUtc(parsedDay));
    }

    return Err(
      new AppError("validation", {
        message: `Invalid period: "${value}". Expected "yyyy-MM" or "yyyy-MM-01"`,
      }),
    );
  }

  return Err(
    new AppError("validation", {
      message: `Invalid period: unsupported input type ${typeof value}`,
    }),
  );
};

/**
 * Creates a validated and branded Period from an unknown value.
 * The resulting Period is normalized to the first day of the month in UTC.
 *
 * @param value - The value to convert (Date, "yyyy-MM", or "yyyy-MM-01")
 * @returns A Result containing the branded Period or an AppError
 */
export const createPeriod = (value: unknown): Result<Period, AppError> => {
  const result = validatePeriod(value);
  if (!result.ok) {
    return result;
  }
  return Ok(createBrand<Date, typeof PERIOD_BRAND>(PERIOD_BRAND)(result.value));
};
