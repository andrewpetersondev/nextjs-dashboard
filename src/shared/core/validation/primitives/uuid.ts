import { ValidationError } from "@/shared/core/errors/domain/base-error.subclasses";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Compiled regex for UUID validation (cached for performance)
 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate if the input is a properly formatted UUID. (Result-based)
 */
export const validateUuidResult = (
  value: unknown,
  label = "id",
): Result<string, ValidationError> => {
  if (typeof value !== "string") {
    return Err(
      new ValidationError(
        `Invalid ${label}: expected string, got ${typeof value}`,
      ),
    );
  }
  const v = value.trim();
  if (v.length === 0) {
    return Err(new ValidationError(`${label} cannot be empty`));
  }
  if (!UUID_REGEX.test(v)) {
    return Err(
      new ValidationError(
        `Invalid ${label}: "${value}". Must be a valid UUID (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx).`,
      ),
    );
  }
  return Ok(v);
};

/**
 * Type guard to check if a value is a valid UUID string
 */
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}

/**
 * Throwing wrapper for UUID validation (for legacy/ergonomic use).
 * Prefers Result-based validateUuidResult for composability.
 */
export function validateUuid(value: unknown, label = "id"): string {
  const r = validateUuidResult(value, label);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
}
