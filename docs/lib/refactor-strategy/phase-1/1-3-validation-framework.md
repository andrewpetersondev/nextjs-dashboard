# Phase 1

## 1.3 Validation Framework (overview)

Goal: consistent, composable validation with a single Validator interface that returns Result<T, ValidationError>. Prefer Zod for schemas and structured field errors; keep tiny rule-based primitives for local checks.

What you get

- A minimal Validator<T> interface returning Result<T, ValidationError>
- Zod-first helpers/adapters (validateWithZod, zodToFieldErrors)
- Simple rule-based primitives for strings (required/min/max) when a schema is overkill
- Composition helpers to chain validators
- Boundary adapter to surface field errors in forms/server actions

---

Where is the code?

- Implementation (minimal examples in this repo):
  - docs/lib/refactor-strategy/code/validation/types.ts
  - docs/lib/refactor-strategy/code/validation/string.validator.ts
  - docs/lib/refactor-strategy/code/validation/zod.adapter.ts
  - docs/lib/refactor-strategy/code/validation/action-result.adapter.ts
- Import paths in app code (via tsconfig aliases):
  - src/lib/validation/types
  - src/lib/validation/string.validator
  - src/lib/validation/zod.adapter
  - src/lib/validation/action-result.adapter
- This page focuses on concepts. Read the source and inline comments for details.

Note: If you colocate Zod schemas with features (e.g., src/features/*), keep generic adapters in src/lib/validation and import them from features.

---

API surface (quick reference)

- Core types
  - Validator<T> with validate(value: unknown): Result<T, ValidationError>
  - ValidationRule<T> for primitive checks (test, message, optional code)
- Helpers
  - compose(...validators): chain validators left→right
  - asValidator(fn): wrap a function into a Validator
- Primitives (string)
  - required(), minLength(n), maxLength(n)
- Zod
  - validateWithZod(schema, value): Result<T, ValidationError>
  - zodToFieldErrors(issues): Record<string, string[]>
  - ZodValidator<T>(schema)
- Boundary adapter
  - toActionValidationResult(result, okMessage?, errorMessage?) → ActionResult<T>

Notes

- ValidationError carries context for diagnostics; fieldErrors is a map suitable for forms.
- Use Zod for DTOs/payloads; use small primitives for micro checks (e.g., a single input).
- Compose validators when you need sequential refinement (normalize → validate → coerce).

---

Mental model (at a glance)

[Unknown input]
  | validateWithZod(schema) → Ok(data) or Err(ValidationError)
  | field error mapping via zodToFieldErrors for forms
[Primitive checks]
  | asValidator/compose → stop on first failing validator
[Boundary]
  | toActionValidationResult(Result) → stable shape for UI

---

Tiny example (only for orientation)

```ts
import { z } from "zod";
// validateWithZod maps Zod issues → ValidationError with fieldErrors
const Signup = z.object({ email: z.string().email(), name: z.string().min(2) });

const r = validateWithZod(Signup, { email: "a@b.com", name: "Jo" });
// r.success === true → r.data is typed { email: string; name: string }
// r.success === false → r.error.context.fieldErrors for form display
```

For primitive checks (quick/local):

```ts
// Pseudo: trim → required → minLength
const trim = asValidator<string>((v) => Ok(String(v).trim()));
const validator = compose<string>(
  trim,
  new StringValidator([
    StringValidator.required(),
    StringValidator.minLength(2),
  ]),
);
```

---

Usage patterns

- Prefer Zod schemas for DTOs and payloads (validateWithZod); keep rule-based primitives for tiny local checks.
- Compose validators to layer normalization and validation (e.g., trim → required → min/max).
- At boundaries, convert Result to your ActionResult using toActionValidationResult for consistent error display.
- Keep validation close to data shape definitions; adapters live in lib/validation.

---

Migration checklist

- Ad-hoc boolean checks → Validators returning Result<T, ValidationError>
- Scattered string messages → ValidationError with structured context and fieldErrors
- try/catch for invalid input → validateWithZod + boundary adapter
- Inline form mapping → zodToFieldErrors centralization

---

Anti‑patterns to avoid

- Mixing multiple validation strategies in the same layer (stick to Zod or validators per module).
- Returning plain booleans/strings for validation failures instead of Result with ValidationError.
- Embedding bespoke field-error mapping logic across components.

---

Testing tips

- Zod: invalid inputs produce Err with fieldErrors keyed by path; valid inputs are Ok with typed data.
- Primitives: required/min/max return Err on failure and Ok on success; ensure non-string inputs error early.
- compose: stops at first Err and passes through the successful value between steps.
- Boundary adapter: ActionResult contains success, message, errors map, and data on success.

---

Acceptance for this section

- Validator interface and composition helpers defined in lib/validation
- StringValidator supports required/min/max
- Zod adapter available: validateWithZod, zodToFieldErrors, optional ZodValidator<T>
- Boundary adapter toActionValidationResult implemented
- Tests cover happy/invalid paths and field-error mapping

