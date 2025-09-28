import type { ValidationError } from "@/shared/core/errors/domain";
import { Ok, type Result } from "@/shared/core/result/result-base";

/**
 * Apply a branding function to a validated value.
 *
 * Combines validation and branding, producing a branded type on success.
 *
 * @typeParam T - The type of the value being validated.
 * @typeParam TBrand - The branded type applied to the validated value.
 * @param validator - A function to validate the input value; returns a `Result<T, ValidationError_New>`.
 * @param brandFn - A function to apply the brand to the validated value.
 * @returns A `Result<TBrand, ValidationError_New>` representing the branded value or validation failure.
 * @example
 * ```typescript
 * const validateNumber = (value: unknown): Result<number, ValidationError_New> =>
 *   typeof value === "number" ? Ok(value) : Err(new ValidationError_New("Not a number"));
 *
 * const brandAsPositive = (value: number) => value as PositiveNumber;
 *
 * const brandWithPositive = brandWith(validateNumber, brandAsPositive);
 *
 * const result = brandWithPositive(42); // Ok with branded value
 * ```
 */
export const brandWith =
  <T, TBrand>(
    validator: (value: unknown) => Result<T, ValidationError>,
    brandFn: (value: T) => TBrand,
  ) =>
  (value: unknown): Result<TBrand, ValidationError> => {
    const r = validator(value);
    return r.success ? Ok(brandFn(r.data)) : r;
  };
