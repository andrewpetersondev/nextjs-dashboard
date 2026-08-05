### Form System Overview

The form system is designed to provide a robust, type-safe way to handle form validation and submission in a Next.js
environment, bridging the gap between Server Actions and client-side UI.

#### Directory Structure

One directory per layer, each one flat — the file suffix names the kind, so it
is not restated as a subdirectory.

- `core/`: The type contract. Types for field errors, field values, form
  results and validation (`*.types.ts`, `*.dto.ts`), the result guard
  (`form-result.guard.ts`), and shared constants.
- `logic/`: Framework-agnostic processing. `FormResult` creation
  (`form-result.factory.ts`), extraction from schemas and errors
  (`*.inspector.ts`), and sparse↔dense error-map conversion (`*.mapper.ts`).
- `presentation/`: UI-specific data adapters
  (`form-error-payload.mapper.ts`).
- `server/`: Next.js server-side utilities. `validate-form.ts` is the primary
  entry point for validating `FormData`; alongside it sit validation-error
  result construction (`form-validation-error.factory.ts`), Zod error
  flattening (`zod-error.mapper.ts`), and `FormData` extraction
  (`form-data.utils.ts`).

#### Key Concepts

- **FormResult**: The boundary DTO union for the `useActionState` edge
  ([ADR 001](adr/001-model-form-state-as-boundary-dto-with-null-idle.md)). It deliberately shares `OkResult` and the
  `ok` discriminant with core `Result`, but it is not a `Result` variant: its error side is a serializable
  `AppErrorJsonDto` — entities in-process, DTOs at the edge.
- **FormState**: `FormResult<T> | null`, the full `useActionState` state. `null` is idle (no submission yet); actions
  return `FormResult`, so idle can only come from the initial render.
- **Dense vs Sparse Error Maps**: The system distinguishes between "dense" maps (where every field has an array, even if
  empty) and "sparse" maps (where only fields with errors are present).
- **Metadata**: Validation errors carry `FormValidationMetadata`, which includes the dense error map and the echoed form
  data (for re-populating fields).
- **Echo allowlist**: `metadata.formData` is client-visible, so nothing is echoed unless explicitly allowlisted —
  `validateForm` echoes only `options.echoFields` (default: none), and mappers building results by hand filter through
  `selectEchoedFieldValues`. Sensitive values (passwords above all) never round-trip to the client.

#### Best Practices

- Use `validateForm` in Server Actions to ensure consistent error handling and logging.
- Opt into field echo deliberately: list only safe-to-display fields in `echoFields` (never passwords or secrets).
- Pass `null` as the `useActionState` initial state; let feedback components (e.g. `useFormMessage` in
  `src/ui/forms/hooks/`) early-return on `null` rather than inventing a fake initial error.
- Prefer `FieldError` (non-empty array) when representing specific validation failures.
