# Auth Module Organization, Naming, and Refactor Strategy

Last updated: 2025-12-15

This document defines how to organize `@/modules/auth` for clarity, correct layering, and predictable responsibilities—while preserving the core constraint:

> `auth/shared` must remain **isomorphic** (no `import "server-only"` and no `"use server"`).

It also proposes an incremental refactor plan toward **workflows + use-cases**, and a scalable infrastructure layout for upcoming integrations (OAuth, email, rate limiting, etc.).

---

## Goals

- Make **runtime boundaries** obvious:
  - `shared/` = safe to import from UI or server (isomorphic)
  - `server/` = server-only code (Next.js server actions, cookies, DB, crypto, JWT)
- Make **layer boundaries** obvious:
  - Application layer depends on ports, not implementations
  - Infrastructure implements ports and contains DB/cookie/JWT/OAuth/etc.
- Make **flow orchestration** easy to follow:
  - Workflows tell stories (multi-step)
  - Use-cases do one verb (single capability)
  - Actions are thin boundaries only

---

## Folder meaning (non-negotiables)

### `src/modules/auth/shared/` (isomorphic)

Contains code that can be imported anywhere, including client components.

Must NOT contain:

- `import "server-only"`
- `"use server"`
- imports from `@/server/**`
- Node-only APIs (`node:*`, filesystem, etc.)
- Next.js server APIs (`next/headers`, `cookies()`, etc.)
- secrets

Can contain:

- domain types/schemas/policies/guards
- contract/transport DTOs used across boundaries
- UI tokens/constants (labels, route strings, error copy)

Recommended subfolders:

- `shared/domain/**` — pure rules/types/schemas
- `shared/contracts/**` — boundary DTOs (transport shapes)
- `shared/ui/**` — UI strings/constants only (no server-only concerns)

### `src/modules/auth/server/` (server-only)

Contains code intended only for server runtime. Allowed to use `import "server-only"` and Next.js server APIs.

Recommended subfolders:

- `server/actions/**` — Next.js Server Actions (thin boundary)
- `server/application/**` — orchestration + ports (no concrete DB/cookie/jwt)
- `server/infrastructure/**` — implementations (DB, cookies, JWT, OAuth, etc.)

### `src/modules/auth/ui/`

Auth module UI components/features (React). Should consume `auth/shared/**` for tokens/schemas/types; should not depend on `auth/server/**`.

---

## Recommended target structure

```text
src/modules/auth/
  shared/                              # ISOMORPHIC ONLY
    domain/
      session/
      user/
    contracts/
    ui/
  server/                              # SERVER-ONLY
    actions/
    application/
      factories/
      observability/
      ports/
      services/
      types/
      use-cases/
      workflows/
    infrastructure/
      db/
        dal/
        repositories/
        adapters/
      session/
        adapters/
      oauth/                           # future
      email/                           # future
      rate-limit/                      # future
  ui/
  hexagonal-architecture.md
  refactor.md
```

Notes:

- Prefer `server/infrastructure/db/**` over `persistence/**` to avoid ambiguity once more infra types exist.
- Keep explicit imports (no barrels) per project rules.

---

## Naming rules (to eliminate ambiguity)

### “Action” means one thing

- **Action** = Next.js Server Action boundary
- Files end with: `*.action.ts`

Actions:

- parse + validate inputs
- call a workflow (or a single use-case)
- unwrap `Result` at the boundary
- translate to UI/redirect/response

Actions do NOT:

- implement multi-step orchestration
- touch DB or JWT directly
- implement domain rules

### Use-cases are verbs (single capability)

- **Use-case** = single operation the application can perform
- Files end with: `*.use-case.ts`

Examples:

- `authenticate-user.use-case.ts`
- `create-user.use-case.ts`
- `establish-session.use-case.ts`
- `rotate-session.use-case.ts`
- `clear-session.use-case.ts`
- `read-session.use-case.ts`

### Workflows tell the story (composition)

- **Workflow** = multi-step orchestration across use-cases/ports
- Files end with: `*.workflow.ts`

Examples:

- `login.workflow.ts` (authenticate + establish session)
- `signup.workflow.ts` (create user + establish session)
- `refresh-session.workflow.ts`
- `logout.workflow.ts`

### Services are helpers, not “god objects”

- **Service** in `server/application/services/**` should exist only when:
  - it’s a reusable helper used by multiple use-cases/workflows, and
  - it doesn’t read well as a single verb use-case
- Prefer extracting verbs into use-cases rather than growing one big `SessionService`.

### Ports and adapters naming

- Port/interface: `*.port.ts`
- Infrastructure adapter that implements a port: `*.adapter.ts`
- Concrete repository/implementation: `*.repository.ts` or `*.client.ts` (choose one convention)

---

## Layer responsibilities (what belongs where)

### `shared/domain/**` (domain, isomorphic)

Contains:

- types, schemas, codecs, guards
- policy constants and policy outcome types
- pure decision helpers (no I/O)

Avoid:

- anything that logs, touches cookies, DB, JWT encode/decode, crypto hashing

### `server/application/**` (application core)

Contains:

- use-cases and workflows
- ports/interfaces the application depends on
- mapping/composition of `Result`s
- error mapping into consistent `AppError` codes at the application boundary

Avoid:

- concrete Drizzle queries
- direct cookie operations
- direct JWT library usage
- direct OAuth/Email SDK usage

### `server/infrastructure/**` (implementations)

Contains:

- DB DAL functions, repositories
- cookie/JWT codec adapters
- OAuth/email/rate limit integrations
- implementations of ports defined in application

---

## Result-first failure semantics (project rule)

- Expected failures are values: `Result<Ok, Err>`
- Unexpected failures are exceptions
- DAL & repositories should trend toward returning `Result` for expected failures (not throwing)
- Unwrap `Result` only at boundaries (actions)

When refactoring, prefer:

- repository returns `Result` for “not found”, “already exists”, validation/policy outcomes
- throw only for invariant violations or programmer errors

---

## Session refactor strategy: from “SessionService” to use-cases + helpers

### Desired model

- Session policy/types stay in `shared/domain/session/**`
- Session storage and token codec remain ports + infrastructure adapters
- Application provides verbs as use-cases:
  - `EstablishSessionUseCase`
  - `RotateSessionUseCase`
  - `ReadSessionUseCase`
  - `ClearSessionUseCase`

### “Tiny service helpers”

Acceptable helpers in `server/application/services/**`:

- a small `issue-session-token` helper used by both establish/rotate
- a normalization helper for claims shapes (if needed)
- _but keep helpers small and dependency-light_

### Migration approach (incremental)

1. Introduce `server/application/use-cases/session/establish-session.use-case.ts`
2. Update `login.workflow.ts` to use the new use-case
3. Introduce `rotate-session.use-case.ts`, update refresh workflow
4. Delete or shrink the old “god service” once all callers are moved

---

## Isomorphic boundary enforcement checklist

If a file is under `auth/shared/**`, it must:

- not import `@/server/**`
- not import `import "server-only"`
- not contain `"use server"`
- not depend on Node-only APIs

If you find violations:

- move the file to `auth/server/**`, or
- replace the dependency with an isomorphic equivalent (e.g., move a brand/type to `src/shared/**`)

---

## Infrastructure scaling plan (for upcoming integrations)

Use capability-based top-level folders under `server/infrastructure/**`:

- `db/**` — Drizzle/DAL/repositories/transactions
- `session/**` — cookie + jwt token codecs
- `oauth/**` — provider integrations (Google/GitHub)
- `email/**` — transactional mail provider
- `rate-limit/**` — request throttling, abuse protection

This prevents a future “misc” folder and keeps dependencies obvious.

---

## Recommended refactor order (keeps code compiling often)

1. **Clean up `auth/shared` isomorphic violations**

- Move any server-only constants out of `shared/`
- Remove any `@/server/**` imports from shared types

2. **Rename `server/infrastructure/persistence` → `server/infrastructure/db`**
3. **Session: introduce use-cases (start with establish)**
4. **Move wiring into `server/application/factories/**`\*\*
5. **Flow-by-flow** migrate actions → workflows → use-cases

- login
- signup
- refresh/verify session
- demo user
- logout

---

## “What goes where?” quick table

| Concern                                   | Folder                                           |
| ----------------------------------------- | ------------------------------------------------ |
| Zod schemas for login/signup              | `auth/shared/domain/user/**`                     |
| Session policy outcome types              | `auth/shared/domain/session/**`                  |
| UI strings (labels, headings, error copy) | `auth/shared/ui/**`                              |
| Next.js server actions                    | `auth/server/actions/**`                         |
| Login story (auth + session)              | `auth/server/application/workflows/**`           |
| Establish session token + cookie          | `auth/server/application/use-cases/**` + ports   |
| Cookie/JWT concrete adapters              | `auth/server/infrastructure/session/adapters/**` |
| Drizzle DAL and repositories              | `auth/server/infrastructure/db/**`               |

---

## Definition of done (for the refactor)

- `auth/shared/**` contains zero server-only imports
- session logic is exposed via use-cases (not a monolithic service)
- workflows read like narratives and are easy to test
- infrastructure is grouped by capability (`db`, `session`, `oauth`, ...)
- actions remain thin and unwrap `Result` only at the boundary
