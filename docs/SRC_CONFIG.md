# Config

This directory contains configuration modules and environment variable validation for the application. All configuration is strictly typed and validated to ensure reliability and security.

> Important: This code is server-only. Secrets must never be accessible from client bundles.

## Files & Folders

- `env.ts`
  - Validates required environment variables at runtime using Zod.
  - Exports strongly-typed constants for use throughout the codebase.
  - Fails fast with a detailed error if required variables are missing/invalid.

- `README.md`
  - Documentation for the config module, including architecture, usage, and extension guidelines.

## Quick Start

1. Create the required environment variables in your shell or `.env` files (per your tooling). Required keys today:
   - `POSTGRES_URL` — Primary database connection string (URL)
   - `POSTGRES_URL_TESTDB` — Test database connection string (URL)
   - `SESSION_SECRET` — Secret string for session/cookie signing
2. Start the app. If anything is missing or invalid, startup will fail with a helpful error that lists the problems.

## Usage Examples

Import validated values instead of reading `process.env`:

```ts
import { POSTGRES_URL, SESSION_SECRET } from "@/src/config/env";

// Use these values directly; they are validated and typed
await connectToDb(POSTGRES_URL);
const session = sign({ userId }, SESSION_SECRET);
```

Avoid `process.env.X` elsewhere in the code. Centralizing validation here ensures consistency and security.

## Adding a New Environment Variable

1. Edit `env.ts`:
   - Extend `envSchema` with the new key and its Zod validator.
   - Re-export the validated value.
2. Document the new variable here (what it is and where it’s used).
3. Ensure CI/CD and local `.env` files are updated with the new key.

Example:

```ts
const envSchema = z.object({
  // existing…
  NEW_FEATURE_FLAG: z.enum(["on", "off"]).default("off"),
});

export const NEW_FEATURE_FLAG = parsed.data.NEW_FEATURE_FLAG;
```

## Testing

- Unit/integration tests should import from `src/config/env` rather than reading `process.env`.
- For test runs, set `POSTGRES_URL_TESTDB` and other necessary variables. If they are missing, tests will fail fast with a descriptive error.

## Troubleshooting

- "Invalid or missing environment variables" on startup:
  - Read the printed JSON block; it lists which keys failed validation.
  - Confirm your `.env`/secrets are actually loaded by your environment (e.g., Next.js, Docker, CI).
  - Ensure values that should be URLs are valid URLs.

## Conventions

- Use Zod for schema validation of environment variables.
- Export validated values; do not export `process.env` directly.
- Document configuration changes with TSDoc in `env.ts` and update this README.
- Keep secrets out of version control and out of client code.

## Security Notes

- Never log secrets. The error output prints only which fields failed (not their values).
- Keep `env.ts` server-only to prevent accidental client exposure.

## FAQ

- Why validate at runtime?
  - To fail fast with actionable errors across environments (local, CI, prod) and to keep a single source of truth for configuration.
- Can we add defaults?
  - Yes. Use Zod `.default()` where safe. Prefer explicit configuration for secrets and critical URLs.
