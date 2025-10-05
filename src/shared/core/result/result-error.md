# Result & Error Modeling Reference

This document provides a concise guide for result and error handling in the `src/shared/core/result` folder.

## Summary

- Enforce discriminated unions for all result and error types.
- Normalize errors to the `AppError` shape before surfacing.
- Ensure all errors are JSON-serializable and safe for client consumption.
- Apply strict TypeScript typing and coding style rules.
- Reference and follow all project instruction files.

## Key Principles

- Use discriminated unions for results:
    - `type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };`
- Normalize unknown/class-based errors to `AppError` using helpers.
- Never leak internal details or stack traces to clients or forms.
- Redact sensitive information before logging or surfacing errors.
- Map backend/domain errors to safe, client-facing error objects.

## Error Handling Approaches

### 1. Backend (Class-Based Errors)

- Use custom error classes for domain/infrastructure errors.
- Include explicit fields: `code`, `kind`, `message`, etc.
- Create and normalize errors via factories and mappers.

### 2. Result/Form Validation (Discriminated Unions)

- Use plain objects (`AppError`) for errors in results.
- Normalize all errors to a common shape for frontend/forms.
- Ensure errors are JSON-safe and do not leak internal details.

### 3. Bridging Backend & Forms

- Catch and normalize class-based errors to `AppError` before returning to frontend/forms.
- Use type guards and mappers to convert between error types.
- Always surface normalized, safe error objects in forms.

## Dense Error Maps for UI

When your UI expects dense error maps (e.g., `{ field: AppError }`), follow these principles:

- **Never pass raw class-based errors to the UI.**  
  Always normalize errors to plain, JSON-serializable objects using error mappers or factories.
- **Expose all necessary fields** (`code`, `message`, etc.) in your error classes to support mapping.
- **Use mapping helpers** from `forms/errors/` and `forms/mapping/` to convert backend/domain errors to dense error maps
  for UI consumption.
- **Ensure all errors passed to the UI are safe, redacted, and do not leak internal details or stack traces.**
- **Document error mapping strategies** in form modules and reference them in your code.

Reference:

- See `forms/errors/error-map-helpers.ts`, `forms/mapping/result-to-form-state.mapping.ts` for mapping patterns.

Validation:

- All errors surfaced in the UI are normalized, JSON-safe, and follow project error modeling instructions.

## Validation Checklist

- All error/result types use strict typing and discriminated unions.
- Errors are normalized, redacted, and mapped for safe client consumption.
- No internal details or stack traces leak to clients or forms.
- All exported types are explicit and documented.
- Error mapping strategies are documented for backend-to-frontend/form boundaries.

## Related Instruction Files

- [Result & Error Instructions](../../../../.github/instructions/result-error.instructions.md)
- [TypeScript Instructions](../../../../.github/instructions/typescript.instructions.md)
- [Coding Style Instructions](../../../../.github/instructions/coding-style.instructions.md)
- [Structure & Architecture](../../../../.github/instructions/structure-architecture.instructions.md)
- [Markdown Docs Instructions](../../../../.github/instructions/md-docs.instructions.md)

---

_Last updated: 2024-06-10 by andrewpetersondev_
