# Error handling strategy for forms and server actions

Checklist
- Use a single, predictable flow in actions: validate -> execute -> map -> return FormState.
- Keep a clear error taxonomy (validation, domain, infrastructure, unknown).
- Build dense errors internally; convert to sparse for UI.
- Centralize mapping of errors to messages and per-field errors.
- Log with context safely; never leak sensitive data.
- Add tests for validation, transform, domain, infra, and unknown errors.

## What the UI receives (sparse), and why we keep dense internally

- UI expects sparse per-field errors: only fields with messages are present.
- Internally we build dense error maps (every allowed field present, possibly empty) for determinism:
    - predictable shape across layers
    - simpler merging/combining of multiple validators
    - easier invariants and tests
    - graceful fallbacks when transforms/unknown errors occur

Result: internal stability with dense maps; boundary adapter converts to sparse before returning to UI.

## Canonical taxonomy

- Validation: field-level errors from schema validation.
- Domain: typed business errors (e.g., CONFLICT, PERMISSION_DENIED), may attach to fields.
- Infrastructure: storage/DB/transport errors (e.g., database error).
- Unknown: anything else; treated as unexpected.

## Standard server action pattern

1) Validate FormData with your generic validator (optionally transform).
2) On failure, return FormState (sparse errors, safe echoed values).
3) On success, execute domain/service logic in try/catch.
4) Map thrown errors to:
    - field errors when applicable (domain with field context)
    - form-level message for infra/unknown
5) Return FormState; don’t throw raw errors to the client.

## Mapping: field errors and messages

- Field errors: keep a single adapter to turn known domain errors into per-field errors (dense internally), then convert to sparse for UI.
- Messages: provide a messageFromError hook to translate known errors/i18n keys; otherwise use generic submit/unexpected messages.

## Logging rules

- Validation failures: log context and issue count only.
- Domain/Infrastructure: log error name/code and context; avoid raw inputs.
- Include correlation/request IDs if available.

## Testing guidance

- Validator: success, schema failure, transform failure, explicit fields/raw path.
- FormState adapter: dense→sparse conversion; redaction; custom messages.
- Action wrapper: validation fail, domain-to-field mapping, infra→generic, unknown→unexpected.
- Cypress: UI renders per-field errors and preserves safe values.
