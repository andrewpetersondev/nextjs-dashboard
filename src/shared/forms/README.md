# Forms

## Purpose

The shared form pipeline: validate a `FormData` submission against a Zod
schema on the server and carry the outcome across the Server Action boundary
as a serializable `FormResult` DTO (never an `AppError` instance).

## Boundaries

- `core/` — the type contract: `FormResult`/`FormState`, dense field-error
  maps, guards. Idle state is `null` (ADR 001).
- `logic/` — universal factories/inspectors/mappers (`makeFormOk`/
  `makeFormError`, field-error extraction by shape, `toSchemaKeys`).
- `server/` — the `validateForm` funnel (Zod parse → dense errors → logging)
  plus FormData utils; values are echoed back only via explicit per-form
  allowlists, so secrets never round-trip.
- `presentation/` — client-side error-payload mapping.

Each layer is flat: the file suffix (`.types`/`.dto`/`.guard`/`.factory`/
`.inspector`/`.mapper`/`.utils`) already names the kind, so there are no
`types/`, `mappers/`, or `factories/` subdirectories to restate it. The layer
is the only axis that encodes a real constraint — `server/` must never be
imported from a client component — which is why it survived the flattening.

Design notes, the security rationale for the echo allowlist, and the ADR live
in [`notes/README.md`](notes/README.md) — read that before reshaping anything
here. Core layering was deliberately kept (see `project_forms_error_refactor`
history).

## Import Rules

- MAY import from `@/shared/core/**`
- MUST NOT import from `@/modules/**`
