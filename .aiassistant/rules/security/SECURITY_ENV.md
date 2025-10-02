---
apply: manually
---

---
tags: [security, env, secrets]
scope: Environment loading, input/output handling
---

# Security & Environment Rules

- Secrets:
    - Never commit secrets. Load via environment with validation.
- Input/Output:
    - Sanitize and validate inputs; encode outputs; narrow CORS; rate-limit sensitive endpoints.
- Logging:
    - Exclude sensitive fields; add operation/identifiers context.
- Env Validation:
    - Define allowed env vars; validate on startup; fail fast with actionable messages.
