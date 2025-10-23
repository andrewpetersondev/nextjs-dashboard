---
apply: off
---

# Security & Privacy Baseline

## Purpose

1. Establish minimum security and privacy expectations for AI-assisted changes and logs.
2. Ensure consistent, serializable, and redacted outputs across the project.

## Precedence

- See: project-rules.md (governance, activation schema)
- See: errors.md and results.md for error/result serialization rules

## Baseline Rules

1. Logs and results must be JSON‑safe; avoid circular/complex objects in outputs.
2. Redact secrets and PII by default in logs, errors, and examples.
3. Prefer least‑privilege defaults for credentials, tokens, and permissions.
4. Keep error/result shapes stable and serializable; reference canonical types.
5. Do not paste secrets into prompts or rule files.
6. Prefer safe fallbacks and explicit denial on uncertain access decisions.

## References

- src/server/config/\* (secrets management)
- src/shared/core/errors/\* (error serialization)
- src/shared/core/result/\* (stable result shapes)

## Low‑Token Playbook (Security)

- Prefer referencing existing helpers (logger, redaction, adapters) over writing custom emitters.
- Avoid dumping large objects into logs; log minimal structured fields only.
- Reuse canonical error/result types; don’t invent new shapes that require more parsing.
- Batch security fixes by file; avoid piecemeal changes that trigger re-analysis cycles.
