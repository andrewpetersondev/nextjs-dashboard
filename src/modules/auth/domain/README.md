# Auth Domain Layer

This layer contains the **core domain model** for authentication: entities, value objects, domain types, and
domain-level invariants.

The domain layer is intentionally **framework-agnostic** and does not depend on Next.js, Drizzle, or other
infrastructure details.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Responsibilities](#responsibilities)
- [Directory Structure](#directory-structure)
- [Key Concepts](#key-concepts)
- [Boundaries & Security](#boundaries--security)
- [Error Handling](#error-handling)

---

## Overview

The domain layer is where we define the **truth** of the auth system:

- What an authenticated user _is_ (types and invariants)
- What values are considered valid (e.g., branded IDs, roles)
- What data is considered sensitive (e.g., password hashes)

All other layers (application, infrastructure, presentation) should treat the domain model as the stable foundation.

---

## Responsibilities

The domain layer:

1. **Defines domain entities and types** (e.g., `AuthUserEntity`, `UserId`, `UserRole`)
2. **Encodes invariants** (what must always be true)
3. **Defines security-sensitive boundaries** (password hashes exist here and must not cross into UI)

The domain layer does **not**:

- Talk to the database
- Read cookies / headers
- Use `FormData`
- Perform side effects (logging, redirects, network)

---

## Directory Structure

The domain is organized by subdomain (`auth-user`, `session`) plus a `shared/`
constants area:

```text
domain/
├── auth-user/
│   ├── entities/        # AuthUserEntity
│   └── policies/        # password.policy.ts, registration.policy.ts
├── session/
│   ├── entities/        # session.entity.ts
│   ├── policies/        # session-lifecycle + authorization/ route policies
│   ├── value-objects/   # auth-brands.value.ts (branded types), time.value.ts
│   └── auth-request-authorization.output.ts
├── shared/
│   └── constants/       # session-config, session-lifecycle, route, request, policy, demo-identity
└── README.md
```

---

## Key Concepts

### 1. Branded Types

IDs and hashes should be modeled with branded types to prevent accidental misuse across boundaries.

### 2. Sensitive Data Lives Here

Password hashes are considered **sensitive** and may exist in domain entities (e.g., `AuthUserEntity.password`).

When data crosses the domain → application boundary, sensitive fields should be removed by mappers (see
`application/shared/mappers/`).

---

## Boundaries & Security

- **Infrastructure → Domain**: database rows are mapped into domain entities (e.g., `UserRow → AuthUserEntity`).
- **Domain → Application**: passwords are stripped when mapping to DTOs (e.g., `AuthUserEntity → AuthenticatedUserDto`).

For the boundary mappers, see:

- `src/modules/auth/application/shared/mappers/flows/login/to-authenticated-user.mapper.ts` — strips the password hash
- `src/modules/auth/application/shared/mappers/flows/login/to-session-principal.mapper.ts` — narrows to the session principal

---

## Error Handling

This codebase uses `Result<T, AppError>` pervasively.

- Domain concepts should remain expressive and avoid leaking infrastructure details.
- Domain-related validation should surface as `AppError` at the appropriate boundary (often in application-layer
  validators).

For details, see the [error-handling flow diagram](../../../../docs/diagrams/error-handling-flow.md).
