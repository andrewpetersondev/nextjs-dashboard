import type { AppError } from "@/shared/errors/core/app-error.class";
import { Ok, type Result } from "@/shared/result/result";

/**
 * Apply a branding function to a validated value.
 *
 * Combines validation and branding, producing a branded type on success.
 *
 * @typeParam T - The type of the value being validated.
 * @typeParam Tbrand - The branded type applied to the validated value.
 * @param validator - A function to validate the input value; returns a `Result<T, AppError>`.
 * @param brandFn - A function to apply the brand to the validated value.
 * @returns A `Result<Tbrand, AppError>` representing the branded value or validation failure.
 */
export const brandWith =
  <T, Tbrand>(
    validator: (value: unknown) => Result<T, AppError>,
    brandFn: (value: T) => Tbrand,
  ) =>
  (value: unknown): Result<Tbrand, AppError> => {
    const r = validator(value);
    return r.ok ? Ok(brandFn(r.value)) : r;
  };

/**
 * Compose validators left-to-right.
 * Stops on first error; passes success value to the next.
 */
export const compose =
  <A, B>(
    v1: (x: unknown) => Result<A, AppError>,
    v2: (x: A) => Result<B, AppError>,
  ) =>
  (x: unknown): Result<B, AppError> => {
    const r1 = v1(x);
    return r1.ok ? v2(r1.value) : r1;
  };
