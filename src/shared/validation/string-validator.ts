import { ValidationError_New } from "@/shared/errors/domain";
import { Err, Ok, type Result } from "@/shared/result/result-base";
import type { ValidationRule, Validator } from "@/shared/validation/types";

/**
 * StringValidator with tiny rule-based checks.
 *
 * Documentation (conceptual, minimal code):
 * docs/lib/refactor-strategy/phase-1/1-3-validation-framework.md
 */
export class StringValidator implements Validator<string> {
  constructor(private readonly rules: ValidationRule<string>[] = []) {}

  static required(message = "Field is required"): ValidationRule<string> {
    return { code: "required", message, test: (v) => v.trim().length > 0 };
  }

  static minLength(min: number, message?: string): ValidationRule<string> {
    return {
      code: "min_length",
      message: message ?? `Must be at least ${min} characters`,
      test: (v) => v.length >= min,
    };
  }

  static maxLength(max: number, message?: string): ValidationRule<string> {
    return {
      code: "max_length",
      message: message ?? `Must not exceed ${max} characters`,
      test: (v) => v.length <= max,
    };
  }

  validate(value: unknown): Result<string, ValidationError_New> {
    if (typeof value !== "string") {
      return Err(
        new ValidationError_New("Value must be a string", {
          expected: "string",
          received: typeof value,
        }),
      );
    }
    for (const rule of this.rules) {
      if (!rule.test(value)) {
        return Err(
          new ValidationError_New(rule.message, { code: rule.code, value }),
        );
      }
    }
    return Ok(value);
  }
}
