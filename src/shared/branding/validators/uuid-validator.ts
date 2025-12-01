import { AppError } from "@/shared/errors/core/app-error.class";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Compiled regex for UUID validation (cached for performance)
 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Create a UUID validator for a specific label (Result-based).
 */
export const uuidValidatorFor =
  (label: string) =>
  (value: unknown): Result<string, AppError> =>
    validateUuidResult(value, label);

/**
 * Validate if the input is a properly formatted UUID. (Result-based)
 */
export const validateUuidResult = (
  value: unknown,
  label = "id",
): Result<string, AppError> => {
  if (typeof value !== "string") {
    return Err(
      new AppError("validation", {
        message: `Invalid ${label}: expected string, got ${typeof value}`,
      }),
    );
  }
  const v = value.trim();
  if (v.length === 0) {
    return Err(
      new AppError("validation", { message: `${label} cannot be empty` }),
    );
  }
  if (!UUID_REGEX.test(v)) {
    return Err(
      new AppError("validation", {
        message: `Invalid ${label}: "${value}". Must be a valid UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).`,
      }),
    );
  }
  return Ok(v);
};
