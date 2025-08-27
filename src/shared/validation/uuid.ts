import { ValidationError_New } from "@/shared/errors/domain";
import { Err, Ok, type Result } from "@/shared/result/result-base";

/**
 * Compiled regex for UUID validation (cached for performance)
 */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates that a string is a valid UUID format
 * (Throw-based for backward compatibility)
 */
export const validateUuid = (id: string, brandName: string): void => {
  const r = validateUuidResult(id, brandName);
  if (!r.success) {
    throw r.error;
  }
};

/**
 * Validate if the input is a properly formatted UUID. (Result-based)
 */
export const validateUuidResult = (
  value: unknown,
  label = "UserId",
): Result<string, ValidationError_New> => {
  if (typeof value !== "string") {
    return Err(
      new ValidationError_New(
        `Invalid ${label}: expected string, got ${typeof value}`,
      ),
    );
  }
  const v = value.trim();
  if (v.length === 0) {
    return Err(new ValidationError_New(`${label} cannot be empty`));
  }
  if (!UUID_REGEX.test(v)) {
    return Err(
      new ValidationError_New(
        `Invalid ${label}: "${value}". Must be a valid UUID format.`,
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
