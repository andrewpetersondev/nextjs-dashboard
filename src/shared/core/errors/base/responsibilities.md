Here’s a concise outline for a robust BaseError class.

Responsibilities

1. Provide a canonical, type-safe error representation across layers.
2. Carry stable metadata for categorization, logging, and control flow.
3. Preserve cause chains without leaking sensitive data.
4. Remain immutable and JSON-safe for serialization.
5. Enable functional composition (adding context, remapping codes).
6. Normalize unknown errors into a consistent shape.

Should contain

1. Canonical identifiers

- code: stable union/enum for error codes.
- category: coarse grouping (e.g., validation, auth, db, network).

2. Operational metadata

- statusCode: HTTP or transport status mapping.
- severity: level for logging/alerting (e.g., info, warn, error, critical).
- retryable: boolean to guide retries/backoff.
- description: human-readable, code-defined default.

3. Message and cause

- message: overrideable display/log message.
- cause: original error or value for causality (non-serializable by default).

4. Context

- context: immutable, JSON-safe diagnostic details (no secrets).
- helpers to merge extra context without mutation.

5. Behavior

- toJSON(): stable, minimal, UI-safe serialization (exclude stack/cause).
- getDetails(): read-only accessor for context.
- withContext(extra): returns a new error with merged context.
- remap(newCode, overrideMessage?): returns a new error with updated code.

6. Normalization helpers (static)

- from(value, fallbackCode, context?): convert unknown to BaseError.
- wrap(code, err, context?, message?): attach canonical code to an existing error/value.

7. Type guards (optional but useful)

- isBaseError(value): runtime check to distinguish error types.

Design principles

1. Immutability: freeze context; avoid mutation; return new instances for changes.
2. JSON-safety: only serialize stable, non-sensitive fields.
3. Stability: codes and metadata are defined centrally and don’t change at runtime.
4. Layering: used in lower layers (DAL/Repo/Service); adapted to UI-facing AppError at boundaries.
