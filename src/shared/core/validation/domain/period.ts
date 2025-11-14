import { format, isValid, parse } from "date-fns";
import { ValidationError } from "@/shared/core/errors/domain/base-error.subclasses";
import { Err, Ok, type Result } from "@/shared/core/result/result";
import { isDateValid } from "@/shared/utils/date/guards";
import { toFirstDayOfMonthUtc } from "@/shared/utils/date/normalize";

/**
 * Result-based normalization into a first-of-month UTC Date.
 */
export function validatePeriodResult(
  input: unknown,
): Result<Date, ValidationError> {
  if (input instanceof Date) {
    if (!isDateValid(input)) {
      return Err(
        new ValidationError("Invalid period: Date instance is not valid"),
      );
    }
    return Ok(toFirstDayOfMonthUtc(input));
  }

  if (typeof input === "string") {
    // Try yyyy-MM format first
    const parsedMonth = parse(input, "yyyy-MM", new Date());

    if (isValid(parsedMonth) && format(parsedMonth, "yyyy-MM") === input) {
      return Ok(toFirstDayOfMonthUtc(parsedMonth));
    }

    // Try yyyy-MM-dd format (must be first day of month)
    const parsedDay = parse(input, "yyyy-MM-dd", new Date());

    if (isValid(parsedDay) && format(parsedDay, "yyyy-MM-dd") === input) {
      if (parsedDay.getUTCDate() !== 1) {
        return Err(
          new ValidationError(
            `Invalid period: date must be the first day of the month, got "${input}"`,
          ),
        );
      }
      return Ok(toFirstDayOfMonthUtc(parsedDay));
    }

    return Err(
      new ValidationError(
        `Invalid period: "${input}". Expected "yyyy-MM" or "yyyy-MM-01"`,
      ),
    );
  }

  return Err(
    new ValidationError(
      `Invalid period: unsupported input type ${typeof input} (expected Date or string)`,
    ),
  );
}

/**
 * Throwing wrapper for period validation (for ergonomic/legacy use).
 */
export function validatePeriod(input: unknown): Date {
  const r = validatePeriodResult(input);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
}
