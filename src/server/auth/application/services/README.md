# SessionManager and Ports

This directory contains the `SessionManager` service and small ports used to manage auth sessions consistently across actions and APIs.

## Why

- Single lifecycle entry point for session operations (establish, read, clear).
- Decoupled adapters via ports to enable per-request instances and avoid singletons.
- Consistent error codes (no custom BaseError subclasses) and alphabetically sorted object properties.

## Usage

```ts
import { SessionManager } from "@/server/auth/application/services/session-manager.service";
import { createSessionCookieAdapter } from "@/server/auth/infrastructure/adapters/session-cookie.adapter";
import { createSessionJwtAdapter } from "@/server/auth/infrastructure/adapters/session-jwt.adapter";
import { logger } from "@/shared/logging/infra/logging.client";

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

## Ports

- `SessionPort`: get/set/delete cookie value
- `SessionTokenCodecPort`: encode/decode JWT payloads

## TTL and constants

`SessionManager` uses `SESSION_DURATION_MS` and cookie options from existing session constants.

## Notes

- Avoid barrels/re-exports; import concrete modules directly.
- Do not add tests here (project rule).
