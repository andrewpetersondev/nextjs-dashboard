import type { AppError } from "@/shared/errors/core/app-error.class";
import { Ok } from "@/shared/result/result";
import type { Result } from "@/shared/result/result.types";

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
 * Chain two validators, passing success value to the next.
 * Stops on first error.
 *
 * @typeParam A - Input type for the first validator.
 * @typeParam B - Output/intermediate type.
 * @param first - First validator to apply.
 * @param second - Second validator to apply to the result of the first.
 * @returns A function that applies both validators in sequence.
 */
export const chain =
  <A, B>(
    first: (x: A) => Result<B, AppError>,
    second: (x: B) => Result<B, AppError>,
  ) =>
  (x: A): Result<B, AppError> => {
    const r1 = first(x);
    return r1.ok ? second(r1.value) : r1;
  };

/**
 * Compose validators left-to-right.
 * Stops on first error; passes success value to the next.
 *
 * @typeParam A - Input type for the first validator.
 * @typeParam B - Output type after composition.
 * @param v1 - First validator (accepts unknown).
 * @param v2 - Second validator (accepts result of first).
 * @returns A function that composes both validators.
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
