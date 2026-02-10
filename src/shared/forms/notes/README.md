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
- `presentation/`: UI-related components and hooks.
    - `components/`: React components like `ErrorMessage`.
    - `hooks/`: React hooks like `useFormMessage`.
    - `mappers/`: UI-specific data adapters.
- `server/`: Next.js server-side specific utilities.
    - `validate-form.ts`: The primary entry point for validating `FormData`.
    - `utils/`: `FormData` extraction and manipulation.

#### Key Concepts

- **FormResult**: A standard `Result` type that either contains a success payload (data + message) or an `AppError` with
  validation metadata.
- **Dense vs Sparse Error Maps**: The system distinguishes between "dense" maps (where every field has an array, even if
  empty) and "sparse" maps (where only fields with errors are present).
- **Metadata**: Validation errors carry `FormValidationMetadata`, which includes the dense error map and the echoed form
  data (for re-populating fields).

#### Best Practices

- Use `validateForm` in Server Actions to ensure consistent error handling and logging.
- Use `useFormMessage` in the UI to manage alert visibility.
- Prefer `FieldError` (non-empty array) when representing specific validation failures.
