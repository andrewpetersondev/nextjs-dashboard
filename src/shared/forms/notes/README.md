### Form System Overview

The form system is designed to provide a robust, type-safe way to handle form validation and submission in a Next.js
environment, bridging the gap between Server Actions and client-side UI.

#### Directory Structure

- `core/`: Fundamental types, guards, and constants.
    - `types/`: Modularized types for field errors, field values, and form results.
    - `guards/`: Type guards for discriminating form results.
- `logic/`: Framework-agnostic logic for processing form data.
    - `factories/`: Creation of `FormResult` objects.
    - `inspectors/`: Tools for extracting information from schemas and errors.
    - `mappers/`: Conversions between different error map shapes (sparse vs dense).
- `presentation/`: UI-specific data adapters (`mappers/`).
- `server/`: Next.js server-side specific utilities.
    - `validate-form.ts`: The primary entry point for validating `FormData`.
    - `factories/`: Construction of validation-error form results.
    - `mappers/`: Zod error flattening.
    - `utils/`: `FormData` extraction and manipulation.

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

#### Best Practices

- Use `validateForm` in Server Actions to ensure consistent error handling and logging.
- Pass `null` as the `useActionState` initial state; let feedback components (e.g. `useFormMessage` in
  `src/ui/forms/hooks/`) early-return on `null` rather than inventing a fake initial error.
- Prefer `FieldError` (non-empty array) when representing specific validation failures.
