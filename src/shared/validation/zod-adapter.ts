import type { ZodType, z } from "zod";
import { ValidationError_New } from "@/shared/errors/domain";
import type { FieldErrors } from "@/shared/forms/types";
import { Err, Ok, type Result } from "@/shared/result/result-base";

export type ZodIssue = z.core.$ZodIssue;

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
          fieldErrors: zodToFieldErrors(parsed.error.issues),
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
