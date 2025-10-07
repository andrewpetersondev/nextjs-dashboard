import { ValidationError } from "@/shared/core/errors/domain/domain-errors";
import { Err, Ok, type Result } from "@/shared/core/result/result";

/**
 * Generic enum validation (Result-based)
 */
export const validateEnumResult = <T extends string>(
  value: unknown,
  enumValues: readonly T[],
  enumName: string,
): Result<T, ValidationError> => {
  if (typeof value !== "string") {
    return Err(
      new ValidationError(
        `Invalid ${enumName}: expected string, got ${typeof value}`,
      ),
    );
  }
  const candidate = value as T;
  if (enumValues.includes(candidate)) {
    return Ok(candidate);
  }
  return Err(
    new ValidationError(
      `Invalid ${enumName}: "${value}". Allowed values: ${enumValues.join(", ")}`,
    ),
  );
};

/**
 * Generic enum validation (throw-based wrapper for backward compatibility)
 */
export const validateEnum = <T extends string>(
  value: unknown,
  enumValues: readonly T[],
  enumName: string,
): T => {
  const r = validateEnumResult(value, enumValues, enumName);
  if (r.ok) {
    return r.value;
  }
  throw r.error;
};
