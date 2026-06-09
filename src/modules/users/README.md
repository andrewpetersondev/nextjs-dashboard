# Users Module

The users module is the **admin-facing CRUD for user accounts** — the
`/dashboard/users` screens where an administrator lists, searches, creates,
edits, and deletes users and sets their role.

It is **distinct from the `auth` module**: `auth` answers *"who is signing in,
and is their session valid?"* (login, signup, sessions); `users` answers
*"manage the people who have accounts."* The two operate on the same user
records and share the role, password-hashing, and validation primitives, but
cover different concerns.

Of the three service-based feature modules, this is the **most structured**: it
uses dependency inversion (a repository contract + adapter), factory-based
composition, `Result` end-to-end, transaction support, and it has real tests.
Where it differs from its siblings, this README says so.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture at a glance](#architecture-at-a-glance)
- [Directory structure](#directory-structure)
- [Key concepts](#key-concepts)
- [Layer responsibilities](#layer-responsibilities)
- [Request flows](#request-flows)
- [Error handling](#error-handling)
- [Testing](#testing)
- [Related documentation](#related-documentation)

---

## Overview

The domain entity carries the full record, including sensitive fields:

```typescript
interface UserEntity {
  readonly email: string;
  readonly id: UserId;          // branded
  readonly password: Hash;      // branded; already hashed
  readonly role: UserRole;      // from the shared user-role policy
  readonly sensitiveData: string;
  readonly username: string;
}
```

The transport DTO **deliberately drops the sensitive fields** — `toUserDto`
returns only `{ id, email, role, username }`. Password hashes and
`sensitiveData` never cross into the UI/API, the same discipline the `auth`
module applies to passwords (and the opposite of the current `invoices`
behaviour — see its [rough edges](../invoices/README.md#conventions--known-rough-edges)).

---

## Architecture at a glance

Everything — reads *and* writes — flows through the service:

```
Server Action ─▶ createUserService(db)  [factory]
                      │
                      ▼
                 UserService ─▶ UserRepositoryContract  [port, defined in application/]
                      │              ▲
                      │              │ implements
                      │       UserRepositoryAdapter ─▶ UserRepositoryImpl ─▶ DAL ─▶ Postgres
                      ▼
                 toUserDto (strips password / sensitiveData)
```

The repository is wired as **ports and adapters**:

- `UserRepositoryContract` (in `application/`) is the **port** — the interface the
  service depends on.
- `UserRepositoryImpl` (in `infrastructure/`) is the concrete repo that calls the
  per-query DAL functions.
- `UserRepositoryAdapter` binds the impl to the contract, so the application layer
  never imports the concrete class — only the interface.

### How it compares to the sibling modules

| Concern | `auth` | `users` | `invoices` |
|---|---|---|---|
| Application style | CQRS use-cases + workflows | single `UserService` | single `InvoiceService` |
| Dependency inversion | yes (contracts) | **yes (contract + adapter)** | no (service holds the concrete repo) |
| Composition | DI composition root | **factory function** | inline in each action |
| Error model | `Result` end-to-end | **`Result` end-to-end** | service `Result`; repo/DAL throw |
| Reads | via use-cases | **via the service** | list/aggregate reads bypass the service |
| Tests | yes | **yes** (service / schema / action) | none yet |

`users` sits between `invoices` (simplest) and `auth` (richest): cleaner than
invoices, lighter than auth.

---

## Directory structure

```
users/
├── domain/                              # Framework-agnostic core
│   ├── entities/user.entity.ts          #   UserEntity, CreateUserProps, UpdateUserProps
│   ├── schemas/user.schema.ts           #   Zod create/edit form schemas (built from shared policies)
│   ├── types/user-id.brand.ts           #   UserId branded type
│   ├── constants/user.constants.ts      #   ITEMS_PER_PAGE_USERS (10), error/success messages
│   ├── user-id.factory.ts               #   build a UserId
│   ├── user-id.mappers.ts               #   toUserId(string) → UserId
│   └── user-id.schema.ts                #   UserId zod schema
│
├── application/                         # Orchestration + ports
│   ├── contracts/user-repository.contract.ts  #   UserRepositoryContract (the port)
│   ├── dtos/user.dto.ts                 #   UserDto (no password / sensitiveData)
│   └── services/user.service.ts         #   UserService — CRUD, hashing, logging; returns Result
│
├── infrastructure/                      # Database + composition
│   ├── factories/user-service.factory.ts      #   createUserService(db) — wires the graph
│   ├── mappers/                         #   to-user-dto.mapper.ts, to-user-entity.mapper.ts
│   └── repository/
│       ├── user.repository.ts           #   UserRepositoryImpl (calls the DAL)
│       ├── user-repository.adapter.ts   #   UserRepositoryAdapter (impl → contract)
│       └── dal/                         #   one function per query (create/read/update/delete + list/count)
│
└── presentation/                        # Next.js server actions + React UI
    ├── actions/                         #   7 server actions (create/update/delete + reads)
    ├── components/                      #   users-table, user-info-panel, user-action-buttons, user-role-select
    ├── forms/                           #   create / edit / delete-button
    └── constants/user-form.constants.ts

__tests__/                               # Vitest unit tests (service); see also the co-located schema/action tests
```

---

## Key concepts

### Relationship to the `auth` module

Both touch "users," so the split matters:

- **`auth`** — credential verification and sessions (login, signup, JWT session
  lifecycle). See [`auth/application/README.md`](../auth/application/README.md).
- **`users`** — administrative management of the accounts themselves.

They share the same user records and the same shared primitives
(`@/shared/policies/user-role`, `@/server/crypto/hashing`,
`@/shared/policies/{email,password,username}`), but neither imports the other's
use-cases.

### Authorization: admin-only, enforced per action

Every server action in this module — the create / update / delete commands **and**
the three reads (which expose user PII) — calls `requireAdmin()` at the top, above
its `try/catch`. The `/dashboard/users` route is already admin-gated by the
middleware, but actions are independently invocable, so each one re-checks. The
`delete-user-form` wrapper inherits the guard by delegating to the guarded delete
action. See the auth module's
[authorization guards](../auth/presentation/README.md#authorization-guards) and
[ADR-007](../auth/notes/adr/007-enforce-action-level-authorization.md).

### Ports and adapters (dependency inversion)

The service depends only on `UserRepositoryContract`, never on a concrete class.
The factory supplies a `UserRepositoryAdapter` wrapping `UserRepositoryImpl`. This
is why the unit test can hand the service a fully mocked repo. See the
[dependency-injection diagram](../../../docs/diagrams/dependency-injection.md).

### `Result` end-to-end + error normalization

Every layer returns `Result<T, AppError>`. The service wraps each operation in
`try/catch` and converts anything unexpected with `normalizeUnknownError(err,
APP_ERROR_KEYS.*)`, so failures are always a typed `Err`, never a thrown
exception escaping the service. Actions then turn `Result` into a `FormResult`
(writes) or unwrap it to a plain value with `unwrapOrNull` (reads).

### Password hashing & sensitive-data stripping

- Passwords are hashed by the injected `HashingService` **before** they reach the
  repository (on create, and on update only when a new password is supplied).
- `toUserDto` is the boundary that removes `password` and `sensitiveData`. Keep new
  sensitive fields out of `UserDto`.

### Validation: shared policies, create vs edit

Form schemas (`user.schema.ts`) are composed from the shared policy schemas
(`EmailSchema`, `PasswordSchema`, `UsernameSchema`, `UserRoleFormSchema`) and use
`strictObject` to reject unknown keys. The **edit** schema makes every field
optional with a preprocessing step where an empty string means *"leave
unchanged"* rather than *"set to empty."* Roles are parsed/validated via
`toUserRole` from the shared user-role policy.

### The entity / DTO family

| Type | Shape | Used for |
|---|---|---|
| `UserEntity` | full record | the domain truth (includes `password`, `sensitiveData`) |
| `CreateUserProps` | `{ email, password: Hash, role, username }` | repository create input (password pre-hashed) |
| `UpdateUserProps` | all fields optional | repository partial update |
| `UserDto` | `{ id, email, role, username }` | transport to UI/API (no secrets) |
| `CreateUserData` / `EditUserData` | `z.output` of the form schemas | validated input into the service |

### Transactions

`UserRepositoryContract.withTransaction(fn)` runs `fn` against a transaction-scoped
repository; the adapter re-wraps the tx repo so the callback still receives the
contract type. Page size for listings is `ITEMS_PER_PAGE_USERS` (10).

---

## Layer responsibilities

- **domain/** — what a user *is*: the entity and its create/update prop shapes, the
  branded `UserId`, the Zod form schemas, and the message constants. No Next.js, no
  Drizzle.
- **application/** — the `UserRepositoryContract` port and the `UserService` that
  orchestrates hashing, the repository, mapping, and logging. Returns
  `Result<…, AppError>`.
- **infrastructure/** — `UserRepositoryImpl` over the DAL, the `UserRepositoryAdapter`,
  the DTO/entity mappers, and the `createUserService` factory. The only layer that
  touches the DB.
- **presentation/** — `"use server"` actions that validate `FormData`, call the
  service through the factory, and adapt `Result` into `FormResult` / plain values,
  plus the React table/form components.

---

## Request flows

### Create / update / delete (command path)

1. The action validates `FormData` against the Zod schema (`validateForm`).
2. It builds the service with `createUserService(getAppDb())`.
3. `UserService` hashes the password if present, calls the repository (through the
   contract → adapter → impl → DAL), and maps the row with `toUserDto`.
4. The action returns a `FormResult` (`makeFormOk` / `makeFormError`).

### Reads (list / by-id / page count)

Same path — the read actions also go through `createUserService(...)` and call
`readFilteredUsers` / `readUserById` / `readUserPageCount`, then unwrap the
`Result` to a plain shape at the action boundary (e.g. `unwrapOrNull(result) ?? []`).

The **update** flow has a dedicated visual companion:
[request-flow-update-user.md](../../../docs/diagrams/request-flow-update-user.md).

---

## Error handling

- The service never throws: each method is wrapped in `try/catch`, and unexpected
  errors are normalized to a typed `AppError` via `normalizeUnknownError` with an
  `APP_ERROR_KEYS` code (`database`, `not_found`, `unexpected`, …).
- Repository/DAL also return `Result`, so an `Err` propagates cleanly upward — no
  mixed throw/return model (contrast `invoices`).
- Actions map `Err` to a `FormResult` with the appropriate key and a user-facing
  message from `USER_ERROR_MESSAGES`.

For when something should be an `AppError`, see
[when-to-use-app-error.md](../../../docs/when-to-use-app-error.md) and the
[error-handling flow diagram](../../../docs/diagrams/error-handling-flow.md).

---

## Testing

This module **has tests** (Vitest) — the most-covered of the feature modules:

- `__tests__/unit/application/services/user.service.test.ts` — `UserService` with a
  fully mocked `UserRepositoryContract`, `HashingService`, and logger; covers
  `readUserById` (found / null / repo-error) and `createUser` (ok / repo-error).
- `domain/schemas/__tests__/user.schema.test.ts` — form-schema validation.
- `presentation/actions/__tests__/create-user.action.test.ts` — the create action.

Run them with `pnpm test` (see [testing.md](../../../docs/testing.md)).

**Coverage gaps worth filling:** `updateUser` / `deleteUser` / `readFilteredUsers`
in the service, the DAL functions, and the update/delete actions are not yet unit-tested.

---

## Related documentation

- [Update-user request flow](../../../docs/diagrams/request-flow-update-user.md) — the visual companion for this module.
- [Dependency injection](../../../docs/diagrams/dependency-injection.md) — the port/adapter/factory pattern used here.
- [Module layering](../../../docs/diagrams/module-layers.md) — which layer may import which.
- [Database ERD](../../../docs/diagrams/database-erd.md) — the `users` table and its relations.
- [project-structure.md](../../../docs/project-structure.md) — where code belongs across the repo.
- Sibling modules: [`invoices`](../invoices/README.md) · [`auth`](../auth/application/README.md).

---

**Last updated:** 2026-06-09
