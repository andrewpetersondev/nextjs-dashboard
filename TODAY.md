Here’s a pragmatic, consistent structure you can adopt to improve organization in src/features and src/server, aligned with clean architecture and strict TypeScript.

Goals

- Strong separation of concerns (domain, application/use-cases, infrastructure, UI).
- Per-feature isolation and discoverability.
- Predictable server-side layering (db, repositories, services, auth, actions).
- Clear import boundaries and easy re-exports.
- Easy testing strategy per layer.

Recommended structure

1. src/features

- One folder per feature, with clear layers inside it.
- Keep “server-only” modules in application/infrastructure subfolders (usable in server actions, API handlers, services).
- Keep UI in ui subfolder and import feature exports from index.ts.
- Ship a small index.ts barrel per feature exposing public surface.

Example template per feature (e.g., customers):

- src/features/customers/
  - domain/
    - types.ts // branded IDs, domain entities, value objects
    - errors.ts // domain-specific error classes (re-export shared ones if applicable)
    - constants.ts
  - dto/
    - request.ts // DTOs for inputs
    - response.ts // DTOs for outputs
    - validation.ts // zod schemas for DTOs
  - application/ // pure “use cases” (no IO), orchestration, business logic
    - use-cases/
      - listCustomers.ts
      - getCustomer.ts
    - ports/ // interfaces for repositories, message buses, etc.
      - CustomerRepository.ts
  - infrastructure/ // IO details (db/dal, mappers, external integrations)
    - db/
      - customer.repository.ts // implements application ports via drizzle-orm
      - customer.dal.ts // if you keep a thin DAL, otherwise fold into repository
    - mappers/
      - customer.mapper.ts
    - gateways/ // external services (email, payments, etc.) if any
  - server/
    - actions/ // Next.js server actions for this feature only
      - listCustomers.action.ts
      - getCustomer.action.ts
    - rpc/ // optional: tRPC/HTTP adapters if you use them per-feature
  - ui/
    - components/ // client/server components specific to this feature
    - hooks/
    - pages/ // if you co-locate feature-specific route segments; otherwise keep in app/
  - tests/
    - domain/
    - application/
    - infrastructure/
  - index.ts // public API for feature (types, use-cases, actions)
  - README.md // per-feature docs, architecture decisions, usage

Notes:

- If you prefer all server actions centralized, replace per-feature server/actions with exports in src/server/actions grouped by feature.
- If a feature is UI-only, keep domain/application/infrastructure minimal or omit entirely.
- Keep DTOs and mappers minimal; avoid leaking db row shapes into UI.

2. src/server

- Host cross-cutting, backend-only modules shared across features; keep route handlers in app/api when using Next.js App Router.
- Keep thin services and repositories here if they’re truly shared; otherwise co-locate under feature infrastructure.

Proposed layout:

- src/server/
  - db/
    - schema/ // drizzle schemas
    - migrations/ // drizzle-kit artifacts
    - client.ts // drizzle client init + connection
    - transactions.ts // helpers for transactions
  - repositories/ // shared repos (if not per-feature)
    - health.repository.ts
  - services/ // cross-cutting business services
    - email.service.ts
    - audit.service.ts
  - auth/
    - tokens.ts // jose helpers, cookie serialization
    - guards.ts // server-side guards, auth checks
    - policies.ts // authorization policies
  - actions/ // optional central server actions by domain group
    - customers/
      - listCustomers.action.ts
  - http/
    - middleware.ts // server-only middleware (rate limit, CORS if applicable)
    - errors.ts // http-layer mappers from domain errors -> status codes
  - telemetry/
    - logger.ts // pino configuration and child logger helpers
    - tracing.ts // OpenTelemetry or similar, if used
  - utils/
    - env.ts // typed env loader (no secrets in repo)
    - crypto.ts
  - types/
    - index.ts // shared server-side types
  - index.ts // public exports for server modules

Key conventions

- Imports and path aliases
  - Use path aliases in tsconfig for clarity:
    - @features/_ -> src/features/_
    - @server/_ -> src/server/_
    - @app/_ -> src/app/_
    - @lib/_ -> src/lib/_
  - Import by layer contract, not implementation (e.g., import CustomerRepository from application/ports; bind to infrastructure in composition roots).

- Barrel files (index.ts)
  - Each feature’s index.ts should export the “public” surface only:
    - domain types and constants
    - DTOs (if used outside)
    - application/use-cases contracts
    - server actions intended for UI
  - Avoid exporting infrastructure internals unless needed for composition.

- Error handling and logging
  - Throw domain errors from domain/application; map them to HTTP or UI-friendly messages in server/http/errors.ts or in server actions.
  - Use a single pino logger instance (src/lib/utils/logger.ts or src/server/telemetry/logger.ts) and pass child loggers to infrastructure.

- Testing
  - Unit tests colocated under tests per layer.
  - e2e tests live under cypress/e2e/<feature> to mirror feature names.
  - Prefer testing application/use-cases in isolation with in-memory ports/mocks.

- Dependency flow
  - domain -> application -> infrastructure
  - ui can depend on domain, dto, and server actions
  - infrastructure implements application ports; never the reverse

- File naming
  - Use dashed or dot-separated suffixes for clarity (e.g., _.repository.ts, _.service.ts, _.action.ts, _.mapper.ts, \*.types.ts).
  - Keep one top-level concept per file; split large use-cases.

Lightweight examples

- Feature barrel (public API):

```textmate
// TypeScript
// src/features/customers/index.ts
export * as CustomerDomain from './domain/types';
export * as CustomerDTO from './dto/response';
export { listCustomers } from './server/actions/listCustomers.action';
// Avoid exporting infrastructure directly.
```

- Application port pattern:

```textmate
// TypeScript
// src/features/customers/application/ports/CustomerRepository.ts
import type { CustomerId, Customer } from '../../domain/types';

export interface CustomerRepository {
  getById(id: CustomerId): Promise<Customer | null>;
  list(params: { readonly limit: number; readonly offset: number }): Promise<readonly Customer[]>;
  count(): Promise<number>;
}
```

- Infrastructure implementing a port:

```textmate
// TypeScript
// src/features/customers/infrastructure/db/customer.repository.ts
import type { CustomerRepository } from '../../application/ports/CustomerRepository';
import type { CustomerId, Customer } from '../../domain/types';
import { db } from '@server/db/client';

export function makeCustomerRepository(): CustomerRepository {
  return {
    async getById(id: CustomerId): Promise<Customer | null> {
      // ... drizzle query
      return null;
    },
    async list({ limit, offset }) {
      // ... drizzle query
      return [];
    },
    async count() {
      // ... drizzle query
      return 0;
    },
  };
}
```

- Server action binding application to infrastructure:

```textmate
// TypeScript
// src/features/customers/server/actions/listCustomers.action.ts
'use server';

import { makeCustomerRepository } from '../../infrastructure/db/customer.repository';
import type { CustomerRepository } from '../../application/ports/CustomerRepository';

export async function listCustomers(params: { readonly page: number; readonly pageSize: number }) {
  const repo: CustomerRepository = makeCustomerRepository();
  // orchestrate, validate, map to DTO if needed
  return { items: await repo.list({ limit: params.pageSize, offset: (params.page - 1) * params.pageSize }) };
}
```

Migration checklist

1. Create per-feature folders and move existing flat files:

- Move \*.types.ts -> domain/types.ts
- Move \*.dto.ts -> dto/[request|response].ts
- Move _.mapper.ts -> infrastructure/mappers/_.mapper.ts
- Move _.dal.ts -> infrastructure/db/_.ts (or into \*.repository.ts)
- Move _.actions.ts -> server/actions/_.action.ts (per-feature) OR centralize in src/server/actions/<feature>/

2. Create application/ports interfaces for each repository and adjust implementations in infrastructure to implement those ports.

3. Add index.ts barrels per feature exposing only domain, DTO, and server actions.

4. Introduce tsconfig path aliases and update imports. Keep strict mode.

5. Update tests to follow new layout; adjust jest/vitest config if used for unit tests. Keep cypress e2e tests under cypress/e2e/<feature>.

6. Update any import boundaries lint rules you use to prevent domain importing infrastructure. If you don’t have one, consider codifying boundaries via code reviews and CI.

7. Verify server actions and Next.js routing still resolve correctly. Keep API routes in app/api; import feature actions from @features/\*.

8. Consolidate logging and error mapping. Use one pino logger and map domain errors to user-facing responses at the edge (server actions or route handlers).

Benefits

- Predictable per-feature structure increases maintainability and onboarding speed.
- Clear dependency direction reduces accidental coupling.
- Co-located actions and infrastructure simplify vertical changes within a feature.
- Barrel files provide a clean, stable public API for each feature.
- Easier testing by layer with minimal mocking.

If you want, I can generate the initial folder scaffolding and minimal index.ts files for your current features and server modules.
