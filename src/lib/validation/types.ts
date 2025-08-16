/**
 * Validation of core types and helpers.
 *
 * Documentation (conceptual, minimal code):
 * docs/lib/refactor-strategy/phase-1/1-3-validation-framework.md
 */
import { Err, Ok, type Result } from "@/lib/core/result";
import { ValidationError_New } from "@/lib/errors/domain.error";

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
