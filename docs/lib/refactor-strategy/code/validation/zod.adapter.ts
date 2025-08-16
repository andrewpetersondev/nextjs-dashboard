// src/lib/validation/zod.adapter.ts
/**
 * Zod adapters for validation.
 *
 * Documentation (conceptual, minimal code):
 * docs/lib/refactor-strategy/phase-1/1-3-validation-framework.md
 */
import type { ZodType } from "zod";
import { Err, Ok, type Result } from "../result";
import { ValidationError } from "../domain.errors";

export type FieldErrors = Record<string, string[]>;

export const zodToFieldErrors = (
  issues: { path: (string | number)[]; message: string }[],
): FieldErrors => {
  const errors: FieldErrors = {};
  for (const i of issues) {
    const key = i.path.join(".") || "_root";
    (errors[key] ??= []).push(i.message);
  }
  return errors;
};

export class ZodValidator<T> {
  constructor(private readonly schema: ZodType<T>) {}

  validate(value: unknown): Result<T, ValidationError> {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      return Err(
        new ValidationError("Validation failed", { issues: parsed.error.issues }),
      );
    }
    return Ok(parsed.data as T);
  }
}

export const validateWithZod = <T>(
  schema: ZodType<T>,
  value: unknown,
): Result<T, ValidationError> => {
  const parsed = schema.safeParse(value);
  return parsed.success
    ? Ok(parsed.data as T)
    : Err(
        new ValidationError("Validation failed", {
          fieldErrors: zodToFieldErrors(parsed.error.issues as any),
        }),
      );
};
