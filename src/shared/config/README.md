# Environment Layers

## 1️⃣ Shared Core (Universal)

- File: `src/shared/config/env-shared.ts`
- Defines canonical env types & schemas (NODE\*ENV, `DATABASE_ENV`, etc.)
- Provides fallbacks + normalization (toLower, cache)
- Safe for use in both server and client contexts
- Exports helper flags: `IS_DEV` / `IS_TEST` / `IS_PROD`

---

## 2️⃣ Server-Only Environment

- File: `src/server/config/env-next.ts`
- Depends on `env-shared` for normalization
- Validates private, runtime-only vars:
  - `DATABASE_URL`
  - `SESSION_SECRET` / `ISSUER` / `AUDIENCE`
  - `LOG_LEVEL`
- Throws early if required values are missing/invalid
- Caches + freezes values for immutability
- Exports both constants and a `getServerEnv()` helper

---
