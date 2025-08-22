You’re on the right track splitting by runtime boundary. Here’s an updated, opinionated structure that keeps feature cohesion, isolates server-only code, and avoids shipping heavy deps to the client.

High-level structure
- src/app
    - Next.js routes, layouts, route handlers, and route-bound server actions. Thin composition layer only.
- src/features
    - Client-safe, feature-specific UI, hooks, mappers, and types. No server APIs, no secrets.
- src/server
    - Server-only business logic, data access, integrations, and validation that must not reach the client.
- src/shared
    - Reusable, framework-agnostic, client-safe utilities and types used across features.
- src/ui
    - Design system: reusable, feature-agnostic components only.
- src/config
    - Public, client-safe config. Server-only env handling lives under src/server.
- src/errors
    - Cross-cutting error classes/mappers (runtime neutral).

Organizing the invoices feature
- Goal: Keep UI and client-safe code in features/invoices, and move all server-bound logic under server/invoices. Split types from schemas if schemas are server-only or pull in heavy deps.

Suggested folders and files

src/features/invoices
- components/
    - InvoiceForm.tsx
    - InvoiceList.tsx
    - InvoiceTable.tsx
    - …
- hooks/
    - useInvoices.ts
    - useInvoiceForm.ts
- lib/
    - formatInvoice.ts         // e.g., money/date formatting, pure functions
    - mapToViewModel.ts        // server DTO -> UI view model mappers (pure)
- types.ts                   // Client-safe types used by UI (no Zod, no server-only imports)
- schema.ts                  // Only if client-side validation is needed and schema is client-safe
- view-models.ts             // Types specifically tailored to UI consumption

src/server/invoices
- entity.ts                  // Domain entity (server-only). Keep import "server-only" here.
- dto.ts                     // Server boundary shapes (input/output for services)
- repo.ts                    // Repository abstraction (queries), imports DB client
- dal.ts                     // Low-level DB access, ORMs, raw SQL, connections
- service.ts                 // Business logic
- validation.ts              // Server-only validation (Zod/Valibot) if not used by client
- mappers.ts                 // Entity/DTO <-> persistence row mappers
- actions.ts                 // Server actions not bound to a specific route, or exported for routes
- index.ts                   // Optional barrel for server-only consumers (keep out of client)

src/app/(dashboard)/invoices
- page.tsx                   // Uses components from features/invoices and calls server actions via src/server/invoices
- loading.tsx
- error.tsx
- route-specific actions.ts  // Only if tightly coupled to this route (otherwise use src/server/invoices/actions.ts)

src/shared
- brands/
    - domain-brands.ts         // Branded ids used everywhere (client-safe)
- utils/
    - currency.ts
    - dates.ts
- constants/
    - pagination.ts
    - routes.ts

What goes where for your current files
- actions.ts → src/server/invoices/actions.ts (server actions)
- service.ts → src/server/invoices/service.ts
- repo.ts → src/server/invoices/repo.ts
- dal.ts → src/server/invoices/dal.ts
- entity.ts → src/server/invoices/entity.ts (keep import "server-only")
- dto.ts → src/server/invoices/dto.ts
- types.ts
    - If client-safe types (used by UI), move to src/features/invoices/types.ts
    - If server-only types (e.g., persistence-specific), keep in src/server/invoices
- schema.ts and validation.ts
    - If used in client forms and has no server-only deps, put minimal client-safe schema in src/features/invoices/schema.ts
    - Keep stricter/server-only validation in src/server/invoices/validation.ts
    - Prefer sharing a base schema in shared and layering server-only refinements on the server if needed

Key conventions and rules
- Server-only directive:
    - Add import "server-only" at the top of files in src/server that could be accidentally imported by client code: entity.ts, service.ts, repo/dal, server-side validation, actions.ts.
- Import boundaries:
    - Client code (src/app client components, src/features, src/ui) must not import from src/server.
    - src/ui must not depend on src/features.
    - src/server may import from src/shared and from src/features/<feature>/types when those types are pure.
- Split types from schemas:
    - Keep TS types used by UI in features. Put server-only schemas in server.
    - If a schema is shared and truly client-safe, keep it in features or shared; otherwise, keep it server-only.
- DTO vs Entity vs ViewModel:
    - Entity: domain model used in server logic and persistence.
    - DTO: boundary types for service input/output and transport.
