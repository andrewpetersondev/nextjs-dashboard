import type { AppError } from "@/shared/errors/core/app-error";
import type { Result } from "@/shared/result/result.types";
import { collectAll, collectTuple } from "@/shared/result/sync/result-collect";

/**
 * Compose multiple validation functions that return Results.
 * Each validator is applied in sequence, short-circuiting on the first error.
 *
 * @typeParam T - The value type being validated.
 * @param validators - Array of validation functions.
 * @returns A function that applies all validators in sequence.
 * @example
 * const validateAge = composeValidators([
 *   (n: number) => validateInteger(n),
 *   (n: number) => validatePositive(n),
 *   (n: number) => validateNumberRange(n, 0, 150),
 * ]);
 * const result = validateAge(25);
 */
export function composeValidators<T>(
  validators: readonly ((value: T) => Result<T, AppError>)[],
): (value: T) => Result<T, AppError> {
  return (value: T) => {
    let current: Result<T, AppError> = { ok: true, value } as const;
    for (const validator of validators) {
      if (!current.ok) {
        return current;
      }
      current = validator(current.value);
    }
    return current;
  };
}

/**
 * Create a validator pipeline that transforms and validates a value through multiple steps.
 *
 * @typeParam I - The input type.
 * @typeParam O - The output type.
 * @param steps - Array of transformation/validation functions.
 * @returns A function that pipes the input through all steps.
 * @example
 * const parseAndValidateAge = pipeValidators([
 *   (s: string) => parseIntResult(s),
 *   (n: number) => validatePositive(n),
 *   (n: number) => validateNumberRange(n, 0, 150),
 * ]);
 * const result = parseAndValidateAge("25");
 */
export function pipeValidators<I, O>(
  steps: readonly [
    (input: I) => Result<unknown, AppError>,
    ...Array<(input: unknown) => Result<unknown, AppError>>,
    (input: unknown) => Result<O, AppError>,
  ],
): (input: I) => Result<O, AppError> {
  return (input: I) => {
    // biome-ignore lint/suspicious/noExplicitAny: Type-safe pipeline implementation
    let current: Result<any, AppError> = { ok: true, value: input } as const;
    for (const step of steps) {
      if (!current.ok) {
        return current;
      }
      current = step(current.value);
    }
    return current as Result<O, AppError>;
  };
}

/**
 * Validate all fields of an object, collecting results.
 * Returns Ok with the validated object or the first Err encountered.
 *
 * @typeParam T - The object type with validators for each field.
 * @param validators - Object with validation functions for each field.
 * @returns A function that validates an object and returns a Result.
 * @example
 * const validateUser = validateObject({
 *   name: (s: string) => fromPredicate(s, s => s.length > 0, () => error('Name required')),
 *   age: (n: number) => validatePositive(n),
 * });
 * const result = validateUser({ name: 'Alice', age: 25 });
 */
export function validateObject<T extends Record<string, unknown>>(
  validators: {
    [K in keyof T]: (value: T[K]) => Result<T[K], AppError>;
  },
): (obj: T) => Result<T, AppError> {
  return (obj: T) => {
    const keys = Object.keys(validators);
    const results: Result<unknown, AppError>[] = [];

    for (const key of keys) {
      const validator = validators[key as keyof T];
      if (validator) {
        results.push(validator(obj[key as keyof T]));
      }
    }

    const collected = collectAll(results);
    if (!collected.ok) {
      return collected as Result<T, AppError>;
    }

    return { ok: true, value: obj } as const;
  };
}

/**
 * Run multiple validators in parallel and collect all results.
 * Returns Ok only if all validations succeed.
 *
 * @typeParam T - Tuple type of validation results.
 * @param validations - Array of validation Result values or functions.
 * @returns A Result containing a tuple of all success values or the first error.
 * @example
 * const results = validateAll([
 *   parseIntResult("10"),
 *   parseFloatResult("3.14"),
 *   toNumberResult("42"),
 * ]);
 */
export function validateAll<T extends readonly Result<unknown, AppError>[]>(
  validations: T,
): Result<
  {
    readonly [K in keyof T]: T[K] extends Result<infer V, AppError> ? V : never;
  },
  AppError
> {
  return collectTuple(...validations) as Result<
    {
      readonly [K in keyof T]: T[K] extends Result<infer V, AppError>
        ? V
        : never;
    },
    AppError
  >;
}

/**
 * Create a conditional validator that only validates if a predicate passes.
 *
 * @typeParam T - The value type.
 * @param predicate - Function to test if validation should run.
 * @param validator - Validation function to run if predicate passes.
 * @returns A function that conditionally validates the value.
 * @example
 * const validateIfString = validateIf(
 *   (v): v is string => typeof v === 'string',
 *   (s) => fromPredicate(s, s => s.length > 0, () => error('Empty string'))
 * );
 */
export function validateIf<T, U extends T>(
  predicate: (value: T) => value is U,
  validator: (value: U) => Result<U, AppError>,
): (value: T) => Result<T | U, AppError> {
  return (value: T) => {
    if (predicate(value)) {
      return validator(value);
    }
    return { ok: true, value } as const;
  };
}
