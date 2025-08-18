import "server-only";
import { Err, Ok, type Result } from "@/lib/core/result.base";
import { ValidationError_New } from "@/lib/errors/error.domain";

export interface Validator<T> {
  validate(value: unknown): Result<T, ValidationError_New>;
}

export type ValidationRule<T> = {
  test(value: T): boolean;
  message: string;
  code?: string; // optional, for diagnostics
};

export const compose = <T>(...validators: Validator<T>[]): Validator<T> => ({
  validate(initial: unknown): Result<T, ValidationError_New> {
    if (validators.length === 0) {
      return Err(new ValidationError_New("No validators provided"));
    }
    let value: unknown = initial;
    for (const v of validators) {
      const r = v.validate(value);
      if (!r.success) return r;
      value = r.data;
    }
    return Ok(value as T);
  },
});

export const asValidator = <T>(
  fn: (value: unknown) => Result<T, ValidationError_New>,
): Validator<T> => ({
  validate: fn,
});

// --- existing code ---

// Map the Ok branch of a Result without changing the error type.
export const mapResult =
  <A, B, E>(fn: (a: A) => B) =>
  (r: Result<A, E>): Result<B, E> =>
    r.success ? Ok(fn(r.data)) : r;

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
    validator: (value: unknown) => Result<T, ValidationError_New>,
    brandFn: (value: T) => TBrand,
  ) =>
  (value: unknown): Result<TBrand, ValidationError_New> => {
    const r = validator(value);
    return r.success ? Ok(brandFn(r.data)) : r;
  };
