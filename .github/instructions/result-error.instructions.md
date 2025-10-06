---
applyTo: '**'
description: 'Result and error modeling, handling, and mapping guidelines for Next.js + TypeScript monorepo.'
---

# Result & Error Instructions

## Purpose

Enforce consistent, type-safe result and error handling across all modules.  
Reference [TypeScript Instructions](./typescript.instructions.md) for strictness and discriminated union rules.

---

## Result Modeling

- Use discriminated unions for all operations that can fail:
    - `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };`
- Prefer explicit result types in all exports; avoid inferred anonymous types.
- For async operations, use `Promise<Result<T, E>>` and handle both paths.
- Use result helpers (`result.ts`, `result-async.ts`, etc.) for mapping, collecting, and transforming results.
- Never rely on presence checks of `error` or `value` alone; always discriminate via the `ok` flag.

---

## Error Modeling

- Model errors as discriminated unions or domain-specific error classes.
- Use explicit error codes and messages (`error-codes.ts`, `error-messages.ts`).
- Prefer domain errors (`domain-error.ts`) for business logic; infrastructure errors for system failures.
- Never leak internal error details or stack traces across API boundaries.
- Use error factories and mappers to normalize external/library errors into app-specific error shapes.
- Redact sensitive information using error redaction utilities before logging or surfacing errors.

---

## Error Handling Patterns

- Catch unknown errors; narrow via type guards or predicates.
- Log errors with structured context (operation, identifiers) using error logger utilities.
- Map internal errors to safe, client-facing messages before returning or throwing.
- In forms, map Zod and domain errors to form state using helpers (`zod-error.helpers.ts`,
  `result-to-form-state.mapping.ts`).
- Always validate and parse inputs server-side; never expose raw ZodError to clients.

---

## Integration with Forms

- Use result and error helpers to map validation outcomes to form state.
- Normalize error shapes for UI consumption; provide i18n-friendly messages.
- Document error mapping strategies in form modules (`forms/errors/`, `forms/mapping/`).

---

## Review Checklist

- All result and error handling uses discriminated unions.
- Errors are normalized, redacted, and logged with context.
- No internal details or stack traces leak to clients.
- All exported result/error types are explicit and documented.
- Form error mapping is consistent and i18n-ready.
- Reference TypeScript and coding style instructions for additional requirements.
