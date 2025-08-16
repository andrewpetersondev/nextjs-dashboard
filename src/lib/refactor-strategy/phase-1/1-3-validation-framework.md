# Phase 1

## 1.3 Validation Framework (`src/lib/validation/`)

Goals
- Single Validator interface returning Result<T, ValidationError>
- Zod-first (adapter + helpers), plus simple rule-based validators for primitives
- Helpers to compose validators and to produce form-friendly field errors

Core API

1) Validator interface and helpers
```typescript
// TypeScript
import { Err, Ok, type Result } from "@/lib/core/result";
import { ValidationError } from "@/lib/errors";

export interface Validator<T> {
  validate(value: unknown): Result<T, ValidationError>;
}

export type ValidationRule<T> = {
  test(value: T): boolean;
  message: string;
  code?: string; // optional, for diagnostics
};

export const compose =
  <T>(...validators: Validator<T>[]): Validator<T> => ({
    validate(value: unknown): Result<T, ValidationError> {
      for (const v of validators) {
        const r = v.validate(value);
        if (!r.success) return r;
      }
      // Last validator decides the type; if none, return as-is
      return validators.length > 0
        ? validators[validators.length - 1].validate(value)
        : Err(new ValidationError("No validators provided"));
    },
  });

export const asValidator =
  <T>(fn: (value: unknown) => Result<T, ValidationError>): Validator<T> => ({
    validate: fn,
  });
```


2) Primitive rule-based validators (keep it minimal)
```typescript
// TypeScript
import { Err, Ok, type Result } from "@/lib/core/result";
import { ValidationError } from "@/lib/errors";
import type { ValidationRule, Validator } from "./validator.interface";

export class StringValidator implements Validator<string> {
  constructor(private readonly rules: ValidationRule<string>[] = []) {}

  static required(message = "Field is required"): ValidationRule<string> {
    return { test: (v) => v.trim().length > 0, message, code: "required" };
  }
  static minLength(min: number, message?: string): ValidationRule<string> {
    return {
      test: (v) => v.length >= min,
      message: message ?? `Must be at least ${min} characters`,
      code: "min_length",
    };
  }
  static maxLength(max: number, message?: string): ValidationRule<string> {
    return {
      test: (v) => v.length <= max,
      message: message ?? `Must not exceed ${max} characters`,
      code: "max_length",
    };
  }

  validate(value: unknown): Result<string, ValidationError> {
    if (typeof value !== "string") {
      return Err(new ValidationError("Value must be a string", { expected: "string", received: typeof value }));
    }
    for (const rule of this.rules) {
      if (!rule.test(value)) {
        return Err(new ValidationError(rule.message, { code: rule.code, value }));
      }
    }
    return Ok(value);
  }
}
```


3) Zod adapter (recommended default)
```typescript
// TypeScript
import type { z, ZodTypeAny } from "zod";
import { Err, Ok, type Result } from "@/lib/core/result";
import { ValidationError } from "@/lib/errors";

export const zodToFieldErrors = (issues: { path: (string | number)[]; message: string }[]) => {
  const errors: Record<string, string[]> = {};
  for (const i of issues) {
    const key = i.path.join(".") || "_root";
    (errors[key] ??= []).push(i.message);
  }
  return errors;
};

export class ZodValidator<T> {
  constructor(private readonly schema: z.ZodType<T>) {}
  validate(value: unknown): Result<T, ValidationError> {
    const parsed = this.schema.safeParse(value);
    if (!parsed.success) {
      return Err(new ValidationError("Validation failed", { issues: parsed.error.issues }));
    }
    return Ok(parsed.data);
  }
}

// Helper to validate and emit field-error map for forms
export const validateWithZod = <T>(schema: ZodTypeAny, value: unknown): Result<T, ValidationError> => {
  const parsed = schema.safeParse(value);
  return parsed.success
    ? Ok(parsed.data as T)
    : Err(new ValidationError("Validation failed", { fieldErrors: zodToFieldErrors(parsed.error.issues) }));
};
```


4) Adapters for form/server-action boundaries
```typescript
// TypeScript
import type { ActionResult } from "@/lib/user.types";
import type { Result } from "@/lib/core/result";
import { ValidationError } from "@/lib/errors";

export const toActionValidationResult = <T>(
  r: Result<T, unknown>,
  okMessage = "OK",
  errorMessage = "Invalid input",
): ActionResult<T> =>
  r.success
    ? { success: true, message: okMessage, errors: {}, data: r.data }
    : {
        success: false,
        message: errorMessage,
        errors:
          r.error instanceof ValidationError && r.error.context?.fieldErrors
            ? (r.error.context.fieldErrors as Record<string, string[]>)
            : { _root: [r.error instanceof Error ? r.error.message : String(r.error)] },
      };
```


Usage patterns
- Prefer Zod schemas for DTOs and payloads (validateWithZod); keep rule-based primitives for small local checks.
- Compose validators when you need layered checks (e.g., trim + min/max length).
- At boundaries, convert Result to ActionResult using toActionValidationResult for consistent error display.

Minimal checklist
- Add Validator interface + compose/asValidator
- Add StringValidator with required/min/max
- Add ZodValidator + validateWithZod + zodToFieldErrors
- Add toActionValidationResult adapter
- Unit tests: happy/invalid paths for primitive and zod validators, field error mapping

