import { format, isValid, parse } from "date-fns";
import { Err, Ok, type Result } from "@/core/result.base";
import { ValidationError } from "@/errors/errors";
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
    let parsed = parse(input, "yyyy-MM", new Date());
    if (isValid(parsed) && format(parsed, "yyyy-MM") === input) {
      return Ok(normalizeToFirstOfMonthUTC(parsed));
    }

    // Try yyyy-MM-dd format (must be first day of month)
    parsed = parse(input, "yyyy-MM-dd", new Date());
    if (isValid(parsed) && format(parsed, "yyyy-MM-dd") === input) {
      if (parsed.getUTCDate() !== 1) {
        return Err(
          new ValidationError(
            `Period date must be the first day of the month, got: "${input}"`,
          ),
        );
      }
      return Ok(normalizeToFirstOfMonthUTC(parsed));
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
