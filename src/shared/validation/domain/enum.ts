import { BaseError } from "@/shared/errors/core/base-error";
import { Err, Ok, type Result } from "@/shared/result/result";

/**
 * Generic enum validation (Result-based)
 */
export const validateEnumResult = <T extends string>(
  value: unknown,
  enumValues: readonly T[],
  enumName: string,
): Result<T, BaseError> => {
  if (typeof value !== "string") {
    return Err(
      new BaseError("validation", {
        message: `Invalid ${enumName}: expected string, got ${typeof value}`,
      }),
    );
  }
  const candidate = value as T;
  if (enumValues.includes(candidate)) {
    return Ok(candidate);
  }
  return Err(
    new BaseError("validation", {
      message: `Invalid ${enumName}: "${value}". Allowed values: ${enumValues.join(", ")}`,
    }),
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
