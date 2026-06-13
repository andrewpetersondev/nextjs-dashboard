# Environment Layers

## 1️⃣ Shared Core (Universal)

- File: `src/shared/config/env-shared.ts`
- Defines canonical env types & schemas (NODE\*ENV, `DATABASE_ENV`, etc.)
- Provides fallbacks + normalization (toLower, cache)
- Safe for use in both server and client contexts
- Exports helper flags: `IS_DEV` / `IS_TEST` / `IS_PROD`

---

## 2️⃣ Server-Only Environment

- File: `src/shared/core/config/server/env-server.ts`
- Depends on `env-shared` for normalization
- Validates private, runtime-only vars:
  - `DATABASE_URL`
  - `SESSION_SECRET`
  - `AUTH_BCRYPT_SALT_ROUNDS`
- Throws early if required values are missing/invalid
- Note: the session JWT `issuer`/`audience` are **not** env vars — they are
  stable code constants in
  `src/modules/auth/infrastructure/session/config/session-jwt.constants.ts`
- Caches + freezes values for immutability
- Exports both constants and a `getServerEnv()` helper

---
