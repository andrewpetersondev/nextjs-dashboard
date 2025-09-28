# Environment Variables

This page lists the environment variables recognized by the app and related tooling. Define them in the appropriate .env file at the project root. The project uses dotenv (via scripts) to load environment files.

Files typically used
- .env.development.local — local development
- .env.test.local — testing (E2E)
- .env.production.local — production or prod-like

Core application variables
- DATABASE_URL — PostgreSQL connection string. Required for migrations, seeds, and runtime DB access.
- SESSION_SECRET — Secret used to sign/encrypt session tokens. Required for auth.
- NODE_ENV — Standard Node environment flag. Typically development, test, or production.

Auth/session tuning
- SESSION_DURATION_MS — Optional. Milliseconds until session expiry. If not set, defaults are used by the session layer.

Operational toggles
- DATABASE_ENV — Optional. Affects cookie security flags in some helpers (e.g., enabling secure cookies in prod-like envs).

Notes
- Never commit real secrets. Prefer per-environment local files (e.g., .env.development.local) and secure secret management in CI/CD.
- If you change SESSION_SECRET, existing cookies/sessions become invalid and users must sign in again.
- Some scripts wrap commands with specific env files: see package.json env:dev, env:test, env:prod scripts.
