import { format, isValid, parse } from "date-fns";
import { BaseError } from "@/shared/errors/core/base-error";
import { Err, Ok, type Result } from "@/shared/result/result";
import { isDateValid } from "@/shared/utils/date/guards";
import { toFirstDayOfMonthUtc } from "@/shared/utils/date/normalize";

/**
 * Result-based normalization into a first-of-month UTC Date.
 */
export function validatePeriodResult(input: unknown): Result<Date, BaseError> {
  if (input instanceof Date) {
    if (!isDateValid(input)) {
      return Err(
        new BaseError("validation", {
          message: "Invalid period: Date instance is not valid",
        }),
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
          new BaseError("validation", {
            message: `Invalid period: date must be the first day of the month, got "${input}"`,
          }),
        );
      }
      return Ok(toFirstDayOfMonthUtc(parsedDay));
    }

    return Err(
      new BaseError("validation", {
        message: `Invalid period: "${input}". Expected "yyyy-MM" or "yyyy-MM-01"`,
      }),
    );
  }

  return Err(
    new BaseError("validation", {
      message: `Invalid period: unsupported input type ${typeof input} (expected Date or string)`,
    }),
  );
}
