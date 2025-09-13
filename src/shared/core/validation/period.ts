import { format, isValid, parse } from "date-fns";
import { ValidationError } from "@/shared/core/errors/domain";
import { Err, Ok, type Result } from "@/shared/core/result/result-base";
import { isValidDate, normalizeToFirstOfMonthUTC } from "@/shared/utils/date";

/**
 * Result-based normalization into a first-of-month UTC Date.
 */
export function validatePeriodResult(
  input: unknown,
): Result<Date, ValidationError> {
  if (input instanceof Date) {
    if (!isValidDate(input)) {
      return Err(
        new ValidationError("Invalid Date provided for period conversion"),
      );
    }
    return Ok(normalizeToFirstOfMonthUTC(input));
  }

  if (typeof input === "string") {
    // Try yyyy-MM format first
    const parsedMonth = parse(input, "yyyy-MM", new Date());

    if (isValid(parsedMonth) && format(parsedMonth, "yyyy-MM") === input) {
      return Ok(normalizeToFirstOfMonthUTC(parsedMonth));
    }

    // Try yyyy-MM-dd format (must be first day of month)
    const parsedDay = parse(input, "yyyy-MM-dd", new Date());

    if (isValid(parsedDay) && format(parsedDay, "yyyy-MM-dd") === input) {
      if (parsedDay.getUTCDate() !== 1) {
        return Err(
          new ValidationError(
            `Period date must be the first day of the month, got: "${input}"`,
          ),
        );
      }
      return Ok(normalizeToFirstOfMonthUTC(parsedDay));
    }

    return Err(
      new ValidationError(
        `Invalid period format: "${input}". Expected "yyyy-MM" or "yyyy-MM-01"`,
      ),
    );
  }

  return Err(
    new ValidationError(
      `Unsupported period input type: ${typeof input}. Expected Date or string`,
    ),
  );
}
