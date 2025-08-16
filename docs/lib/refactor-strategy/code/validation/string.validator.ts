// src/lib/validation/string.validator.ts
/**
 * StringValidator with tiny rule-based checks.
 *
 * Documentation (conceptual, minimal code):
 * docs/lib/refactor-strategy/phase-1/1-3-validation-framework.md
 */
import { Err, Ok, type Result } from "../result";
import { ValidationError } from "../domain.errors";
import type { ValidationRule, Validator } from "./types";

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
      return Err(
        new ValidationError("Value must be a string", {
          expected: "string",
          received: typeof value,
        }),
      );
    }
    for (const rule of this.rules) {
      if (!rule.test(value)) {
        return Err(
          new ValidationError(rule.message, { code: rule.code, value }),
        );
      }
    }
    return Ok(value);
  }
}
