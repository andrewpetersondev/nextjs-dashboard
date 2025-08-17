import "server-only";

import type { core, ZodType } from "zod";
import { Err, Ok, type Result } from "@/lib/core/result";
import { ValidationError_New } from "@/lib/errors/error.domain";

export type ZodIssue = core.$ZodIssue;

/**
 * Zod adapters for validation.
 *
 * Documentation (conceptual, minimal code):
 * docs/lib/refactor-strategy/phase-1/1-3-validation-framework.md
 */

export type FieldErrors = Record<string, string[]>;

export const zodToFieldErrors = (issues: ZodIssue[]): FieldErrors => {
  const errors: FieldErrors = {};
  for (const i of issues) {
    const key = i.path.join(".") || "_root";
    let arr = errors[key];
    if (!arr) {
      arr = [];
      errors[key] = arr;
    }
    arr.push(i.message);
  }
  return errors;
};

export class ZodValidator<T> {
  constructor(private readonly schema: ZodType<T>) {}

  validate(value: unknown): Result<T, ValidationError_New> {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      return Err(
        new ValidationError_New("Validation failed", {
          issues: parsed.error.issues,
        }),
      );
    }
    return Ok(parsed.data as T);
  }
}

export const validateWithZod = <T>(
  schema: ZodType<T>,
  value: unknown,
): Result<T, ValidationError_New> => {
  const parsed = schema.safeParse(value);
  return parsed.success
    ? Ok(parsed.data as T)
    : Err(
        new ValidationError_New("Validation failed", {
          fieldErrors: zodToFieldErrors(parsed.error.issues),
        }),
      );
};
