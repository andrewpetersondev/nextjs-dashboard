# SessionManager and Ports

This directory contains the `SessionManager` service and small ports used to manage auth sessions consistently across actions and APIs.

## Why

- Single lifecycle entry point for session operations (establish, read, clear).
- Decoupled adapters via ports to enable per-request instances and avoid singletons.
- Consistent error codes (no custom AppError subclasses) and alphabetically sorted object properties.

## Usage (factory + DI)

```ts
import { SessionManager } from "@/server/auth/application/services/session-manager.service";
import { createSessionCookieAdapter } from "@/server/auth/infrastructure/adapters/session-cookie.adapter";
import { createSessionJwtAdapter } from "@/server/auth/infrastructure/adapters/session-jwt.adapter";
import { logger } from "@/shared/logging/infra/logging.client";

// Preferred: compose via factory to avoid singletons and make testing easier
const sessionManager = new SessionManager(
  createSessionCookieAdapter(),
  createSessionJwtAdapter(),
  logger,
);

// Establish
await sessionManager.establish({ id: userId, role });

// Read
const session = await sessionManager.read();

// Clear
await sessionManager.clear();
```

Alternatively, use the convenience factory:

```ts
import { createSessionManager } from "@/server/auth/application/services/factories/session-manager.factory";

const sessionManager = createSessionManager();
```

## Ports

- `SessionPort`: get/set/delete cookie value
- `SessionTokenCodecPort`: encode/decode JWT payloads

## JWT claims shape (flat)

All JWTs use a flat claims shape handled by the JWT adapter/port:

```ts
type FlatEncryptPayload = {
  expiresAt: number; // ms
  role: UserRole;
  sessionStart: number; // ms epoch when the rolling session began
  userId: string; // encoded UserId
  exp?: number; // seconds (added by jose)
  iat?: number; // seconds (added by jose)
};
```

Helpers like `timeLeftMs` accept `{ expiresAt?: number; exp?: number }` and prefer `expiresAt`.

## TTL and constants

`SessionManager` uses `SESSION_DURATION_MS` and cookie options from existing session constants.

## Notes

- Avoid barrels/re-exports; import concrete modules directly.
- Prefer factories over singletons. The singleton exports in adapters are deprecated.

## Testing guidance

- Compose `SessionManager` with in-memory `SessionPort` and a stub `SessionTokenCodecPort` in tests.
- Use fake timers to control `sessionStart` and rotation windows.
- See `session-manager.service.test.ts` for examples covering `establish`, `read`, `clear`, and `rotate`.
