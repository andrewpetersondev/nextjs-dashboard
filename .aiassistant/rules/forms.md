---
apply: off
---

# Form Handling Rules

## Purpose

1. Provide a consistent contract for form validation results and error mapping to UI.
2. Ensure dense, JSON‑safe field error maps and safe value echoing.

## Precedence

- See: project-rules.md (governance, activation, authoring)
- See: results.md (Result helpers)
- See: errors.md (AppError/BaseError model and adapters)

## Rules

1. Return dense field error maps: every field key present; value is readonly string[] (may be empty).
2. Use a single adapter per feature/domain to convert AppError → FormResult.
3. Detect targeted conflicts (e.g., duplicate email) and attach field‑specific messages; otherwise provide a generic message and empty arrays for unaffected fields.
4. Echo values via display‑safe selectors with redaction; never include secrets/PII.
5. Prefer validateFormGeneric (validation → transform → normalize) instead of ad‑hoc parsing.

## References

- src/shared/forms/core/types.ts
- src/server/forms/validate-form.ts

## Implementation Checklist (Forms)

- Ensure validateFormGeneric is used in actions to unify validation/transform/normalize.
- Always return dense field error maps and echo values via display‑safe selectors with redaction.

## Quickstart (Low-effort, high‑value)

- Validate + shape result with one call:
  - Use src/server/forms/validate-form.ts validateFormGeneric(formData, schema, allowedFields?, opts)
  - It returns FormResult (Ok or validation Err) with a dense field error map.
- Map domain Result to FormResult when you already have Result<T, FormError>:
  - Use src/shared/forms/mapping/result-to-form.mapper.ts mapResultToFormResult(result, { fields, raw, redactFields? })
- Turn Zod issues into dense field errors without extra parsing:
  - Use src/shared/forms/mapping/zod-to-form-errors.mapper.ts mapToDenseFieldErrorsFromZod(error, fields)

## Low‑Token Playbook (Minimize credit usage)

1. Prefer adapters over ad‑hoc code.
   - Rationale: Reusing validateFormGeneric and mapResultToFormResult avoids opening/rewriting multiple files and reduces follow‑up fixes.
2. Always build dense maps up front.
   - Avoid post‑processing undefined checks in the UI; dense maps keep rendering logic O(1) and cut branching prompts.
3. Echo only what’s needed, already redacted.
   - Use selectDisplayableStringFieldValues(raw, fields, redactFields?) and pass a minimal fields list; avoid echoing large text areas or blobs.
4. Keep error messages short and canonical.
   - Prefer FORM_ERROR_MESSAGES constants; avoid interpolating large data into messages.
5. Use defaults; don’t over‑configure.
   - validateFormGeneric: pass just schema and (optionally) allowedFields; omit custom messages unless required.
   - mapResultToFormResult: rely on default success/failure messages and default redactFields.
6. Treat unknown like Zod.
   - If you only have error.issues, call mapToDenseFieldErrorsFromZod and skip constructing full ZodError.
7. Avoid repeated parsing.
   - Parse once (schema.safeParseAsync) via validateFormGeneric; pass the shaped result onward.

## Do / Don’t

- Do
  - Use dense error maps: DenseFieldErrorMap<TField, string>
  - Centralize adapter per feature: AppError → FormResult or Result → FormResult
  - Reuse constants: FORM_ERROR_MESSAGES, FORM_SUCCESS_MESSAGES
  - Redact secrets by default: redactFields = ["password"]
- Don’t
  - Don’t echo raw FormData directly to UI; always select and redact
  - Don’t attach large payloads to error.details/values
  - Don’t create new result shapes; use FormResult and helpers

## Adapter Template (copy/paste)

Example: Convert a service Result<T, FormError<TField>> to FormResult with safe value echo.

```ts
import { mapResultToFormResult } from "@/shared/forms/mappers/result-to-form-result.mapper";

export async function adaptServiceResultToForm<TField extends string, T>(p: {
  readonly result: import("@/shared/core/result/result").Result<
    T,
    import("@/shared/forms/types/form-result.types").FormError<TField>
  >;
  readonly fields: readonly TField[];
  readonly raw: Record<string, unknown>;
}) {
  return mapResultToFormResult<TField, T>(p.result, {
    fields: p.fields,
    raw: p.raw,
  });
}
```

## File Pointers

- Validation flow: src/server/forms/validate-form.ts (validateFormGeneric)
- Zod → field errors: src/shared/forms/mapping/zod-to-form-errors.mapper.ts
- Result → FormResult: src/shared/forms/mapping/result-to-form.mapper.ts
- Types: src/shared/forms/core/types.ts, src/shared/forms/types/dense.types.ts
