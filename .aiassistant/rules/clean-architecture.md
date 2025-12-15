---
apply: always
---

# AI Rules: Clean Hexagonal Architecture for `src/modules/auth/server`

This document defines **AI-enforceable rules** for maintaining **Clean Architecture + Hexagonal (Ports & Adapters)** boundaries inside the Auth module’s **server-side** code.

These rules are intended to guide AI code generation, refactoring, and review.

---

## Scope

Applies **only** to:

```
src/modules/auth/server/**
```

Out of scope:

- UI (`modules/auth/ui`)
- Shared cross-module utilities (`modules/auth/shared`, `src/shared`)
- Next.js app routing (`src/app`)

---

## Architectural Intent (Authoritative)

- **Auth business logic must be framework-agnostic**
- **Dependencies flow inward**
- **Infrastructure is replaceable**
- **Actions are adapters, not logic holders**

The Auth module is a **self-contained bounded context**.

---

## Canonical Layer Model

```
Actions (Adapters)
    ↓
Workflows (Process orchestration)
    ↓
Use Cases (Application logic)
    ↓
Services (Domain behavior)
    ↓
Ports (Interfaces)
    ↑
Infrastructure (Adapters, DB, Session, Cookies)
```

---

## Folder-to-Layer Mapping (Authoritative)

| Folder                         | Layer           | Notes                      |
| ------------------------------ | --------------- | -------------------------- |
| `server/actions`               | Adapter         | Entry points only          |
| `server/application/use-cases` | Application     | Transaction boundaries     |
| `server/application/workflows` | Application     | Multi-step orchestration   |
| `server/application/services`  | Domain Services | Core auth logic            |
| `server/application/ports`     | Ports           | Interfaces only            |
| `server/infrastructure/**`     | Infrastructure  | Adapters + implementations |

---

## Dependency Rules (Hard Rules)

### Rule 1: No Inward Violations

❌ **Forbidden imports** in `application/**`, `services/**`, `use-cases/**`:

- `next/*`
- `react/*`
- `cookies-next`
- `jsonwebtoken`
- `prisma`
- `drizzle`
- `@/server/*`

✔ Allowed:

- `application/ports/*`
- `shared/domain/*`
- `shared/contracts/*`
- `shared/errors/*`

---

### Rule 2: Ports Are Owned by the Application

- All ports **must live in**:

```
server/application/ports
```

- Ports define **capabilities**, not technologies

✔ Good:

```ts
export interface SessionPort {
  read(): Promise<Session | null>;
}
```

❌ Bad:

```ts
export interface JwtSessionPort {}
```

---

### Rule 3: Infrastructure Implements Ports

- Infrastructure **may import ports**
- Ports **must never import infrastructure**

✔ Allowed:

```ts
class SessionJwtAdapter implements SessionPort {}
```

❌ Forbidden:

```ts
import { SessionJwtAdapter } from "@/modules/auth/server/infrastructure";
```

---

### Rule 3.1: Transactions Use a Unit Of Work Port (Hard Rule)

- Transactions are owned by the application layer via `UnitOfWorkPort`.
- Repository ports MUST NOT expose `withTransaction`.
- Transaction-scoped deps (`AuthTxDeps`) MUST be **DB-only** (repositories only).
  - ❌ No cookies, JWT, hashing/crypto, HTTP, network calls inside `AuthTxDeps`.

---

## Action Rules (Adapters)

### Rule 4: Actions Are Thin

Actions may:

- Parse input
- Call **one workflow or use case**
- Translate result to HTTP response

Actions must not:

- Contain business rules
- Call repositories directly
- Perform crypto, auth, or DB logic

✔ Pattern:

```ts
export async function loginAction(input) {
  return loginWorkflow.execute(input);
}
```

---

## Workflow Rules

### Rule 5: Workflows Coordinate, Not Decide

Use a **workflow** when the logic:

- Spans **multiple use cases or services**
- Represents a **user-facing or system-facing process**
- Requires **sequencing**, retries, or branching
- Coordinates **session + user + policy** logic together

Workflows:

- Orchestrate calls
- Handle process-level concerns
- May short-circuit based on results

Workflows must not:

- Contain business rules
- Validate domain invariants
- Perform persistence directly

✔ Examples:

- `login.workflow.ts`
- `signup.workflow.ts`
- `refresh-session.workflow.ts`

❌ Not a workflow:

- A single persistence operation
- A pure business rule

---

## Use Case Rules

### Rule 6: Use Cases Represent Application Capabilities

Use a **use case** when the logic:

- Represents **one business capability**
- Has a **clear input → output contract**
- Owns a **transaction boundary**
- Can be executed independently of UI

Use cases:

- Coordinate **services + ports**
- Enforce application-level rules
- Return `Result`

✔ Examples:

- `establish-session.use-case.ts`
- `rotate-session.use-case.ts`
- `clear-session.use-case.ts`

❌ Not a use case:

- Low-level auth rules
- Cross-capability orchestration

---

### Rule 7: Use Cases Depend on Ports, Not Implementations

✔ Allowed:

```ts
constructor(sessionPort: SessionPort)
```

❌ Forbidden:

```ts
constructor(sessionAdapter: SessionJwtAdapter)
```

---

## Service Rules (Domain Services)

### Rule 8: Services Encode Core Auth Rules

Use a **service** when the logic:

- Is a **pure business rule**
- Is reusable across **multiple use cases or workflows**
- Does not represent a full user action

Services:

- Are stateless
- Operate on domain values
- Are framework-agnostic
- Compose `Result`s

Services must not:

- Know about HTTP, cookies, headers
- Know about databases or adapters
- Own transactions

✔ Examples:

- `auth-user.service.ts`
- `session.service.ts`

❌ Not a service:

- Request authorization flow
- Login/signup orchestration

---

## Factory Rules

### Rule 9: Factories Are the Only Composition Root

- Factories live in:

```
server/application/factories
```

Factories may:

- Wire infrastructure → ports → services → use cases

Factories must not:

- Contain logic
- Be imported into domain or services

---

## Testing Rules

### Rule 10: Test the Right Layer

- Services: pure unit tests
- Use cases: mocked ports
- Infrastructure: integration tests

❌ No infrastructure in service tests

---

## Naming Rules (AI-Enforced)

- `*.action.ts` → adapter only
- `*.workflow.ts` → orchestration
- `*.use-case.ts` → single capability
- `*.port.ts` → interface
- `*.adapter.ts` → infrastructure implementation

---

## Allowed Cross-Module Imports

✔ Allowed:

- `modules/auth/shared/**`
- `src/shared/**`

❌ Forbidden:

- Importing another module’s `server/**`

---

## AI Enforcement Checklist

Before generating or modifying code:

- [ ] Does this file belong to the correct layer?
- [ ] Are imports flowing inward only?
- [ ] Is infrastructure isolated?
- [ ] Is the action thin?
- [ ] Is business logic framework-free?
- [ ] If using a transaction: is it via `UnitOfWorkPort`, and are tx deps DB-only?

If any answer is **no**, refactor before proceeding.

---

## Result & Error Handling (Authoritative)

These rules integrate the project-wide **Result-first** and **error modeling** standards into the Auth hexagonal architecture.

---

### Rule 11: Classify Failures Explicitly

- **Expected failures** are values:
  - Validation errors
  - Policy violations
  - Not-found / already-exists
  - Auth/session denial

- **Unexpected failures** are exceptions:
  - Programmer errors
  - Broken invariants
  - Impossible states

---

### Rule 12: Result Is Mandatory for Expected Failures

- Use `Result<Ok, Err>` from:

```
@/shared/result
```

Rules by layer:

| Layer                          | Rule                                               |
| ------------------------------ | -------------------------------------------------- |
| Infrastructure (DAL, adapters) | Return `Result`, never throw for expected failures |
| Services / Use Cases           | Compose & map `Result`s                            |
| Actions (boundaries)           | Unwrap `Result` and translate to HTTP/UI           |

✔ Allowed:

```ts
return Err(AuthErrors.invalidCredentials());
```

❌ Forbidden:

```ts
throw new Error("Invalid credentials");
```

---

### Rule 13: Exceptions Are for Invariants Only

Throw **only** when:

- A programmer error occurs
- A domain invariant is violated

Never throw for:

- Auth denial
- Expired sessions
- Invalid input

---

### Rule 14: Centralized Error Modeling

- Use error factories from:

```
@/shared/errors/factories/app-error.factory
```

- Errors must:
  - Use **error codes**
  - Avoid custom subclasses
  - Be mappable at boundaries

---

## Code Style & API Compatibility (AI-Enforced)

### Rule 15: Platform Compatibility

- Use APIs compatible with:
  - Next.js **v16+**
  - React **19+**
  - TypeScript **5.9+**

- Avoid deprecated APIs

---

### Rule 16: Code Style Consistency

- Alphabetize:
  - Object literal properties
  - Interface fields
  - Type members

- Avoid:
  - Re-exports
  - Barrel files

- Explicitly type:
  - Function arguments
  - Return values

- Use **TSDoc**, not JSDoc

---

## Project Structure Alignment

### Rule 17: Module Boundaries

- Features live under:

```
@/modules/{feature}/{server,shared,ui}
```

- `server` follows hexagonal rules defined in this document
- `ui` contains React components only
- `shared` contains cross-layer, framework-agnostic code

---

## Final Principle

> **Auth is a domain, not a framework feature.**

- Next.js is an adapter
- Cookies and JWTs are adapters
- Databases are adapters

Business rules live in the core and are expressed as **values first, exceptions last**.
