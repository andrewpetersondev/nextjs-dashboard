import { AppError } from "@/shared/errors/core/app-error";
import { Err, Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

/**
 * Creates a factory function that validates enum values.
 *
 * @param enumName - A human-readable name for error messages
 * @param enumValues - The readonly array of valid enum values
 * @typeParam T - The enum type (extends string)
 * @returns A factory function that validates unknown values against the enum
 */
export const createEnumValidator = <T extends string>(
  enumName: string,
  enumValues: readonly T[],
) => {
  return (value: unknown): Result<T, AppError> => {
    if (typeof value !== "string") {
      return Err(
        new AppError("validation", {
          cause: "",
          message: `Invalid ${enumName}: expected string, got ${typeof value}`,
          metadata: {
            enumName,
            expectedType: "string",
            receivedType: typeof value,
          },
        }),
      );
    }
    const candidate = value as T;
    if (enumValues.includes(candidate)) {
      return Ok(candidate);
    }
    return Err(
      new AppError("validation", {
        cause: "",
        message: `Invalid ${enumName}: "${value}". Allowed values: ${enumValues.join(", ")}`,
        metadata: { allowedValues: enumValues, enumName, value },
      }),
    );
  };
};
