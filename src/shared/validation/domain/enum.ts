import { AppError } from "@/shared/errors/core/app-error.class";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Generic enum validation (Result-based)
 */
export const validateEnumResult = <T extends string>(
  value: unknown,
  enumValues: readonly T[],
  enumName: string,
): Result<T, AppError> => {
  if (typeof value !== "string") {
    return Err(
      new AppError("validation", {
        message: `Invalid ${enumName}: expected string, got ${typeof value}`,
      }),
    );
  }
  const candidate = value as T;
  if (enumValues.includes(candidate)) {
    return Ok(candidate);
  }
  return Err(
    new AppError("validation", {
      message: `Invalid ${enumName}: "${value}". Allowed values: ${enumValues.join(", ")}`,
    }),
  );
};
