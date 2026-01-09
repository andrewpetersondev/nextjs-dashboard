---
apply: always
---

# Naming Conventions

Standardized naming to ensure predictability, discoverability, and easy refactoring.

- Make intent obvious from names (especially at boundaries).
- Keep imports predictable (deep imports are allowed).
- Reduce “synonym drift” (`map*` vs `to*` vs `convert*`).
- Make tests mirror the unit they validate.

---

## Core Naming Principles

1. **Consumer-Centric Naming**: Use Cases and Workflows should depend on "Services" or "Repositories." Avoid implementation-leaky words like "Adapter" or "Cookie" in Application layer contracts or dependency names.
2. **Consistency Over Strict Suffixes**: If an object is treated as a "Service" by its consumers, its contract and dependency name should reflect that (e.g., `SessionServiceContract`), even if it is implemented by an adapter.
3. **Domain-Aligned Verbs**: Method names in contracts should match the business language (e.g., `terminate` instead of `deleteCookie`).
4. **Logic vs. Capability**:
   - **Policies (`.policy.ts`)**: The "Brain" - Pure business rules, logic, and invariants (no side effects).
   - **Contracts (`.contract.ts`)**: The "Hands" - Interfaces for side-effects, persistence, or external capabilities.
5. **Reduce Synonym Drift**: Stick to the standard verb vocabulary to keep the codebase predictable.

---

## File and Folder Naming

- **Files**: Use **kebab-case**. Filename must match the **primary export** (e.g., `to-pg-error.ts` exports `toPgError`).
- **Folders**: Use **nouns** (e.g., `catalog/`, `factories/`, `utils/`, `helpers/`).
- **One Concept Per File**: Avoid `*.types.ts` files. Split types into files reflecting their role (e.g., move a DTO type to a `.dto.ts` file).
- **Prefixing**: Boundary files (DTOs, Schemas, Transports) should be named after the **action** or **concept**, not just the module (e.g., `login-credentials.schema.ts` instead of `auth-user.schema.ts`).

### Boundary-Explicit Suffixes

| Suffix          | Meaning                                  | Layer/Boundary               |
| :-------------- | :--------------------------------------- | :--------------------------- |
| `.entity.ts`    | Stateful domain object (with identity)   | Domain (Entities)            |
| `.value.ts`     | Value object / Branded primitive         | Domain (Entities)            |
| `.policy.ts`    | Pure function for business rules/logic   | Domain / Application         |
| `.schema.ts`    | Zod/Validation schema                    | Application ↔ Presentation   |
| `.dto.ts`       | Stable data transfer object              | Application (Use Cases)      |
| `.helper.ts`    | Reusable orchestration logic (stateless) | Application / Infrastructure |
| `.transport.ts` | Wire/HTTP/Cookie-only shape              | Interface Adapters           |
| `.view.ts`      | Server → Client UI shape                 | UI Boundary                  |
| `.contract.ts`  | Dependency boundary interface (Port)     | Domain/Application           |
| `.adapter.ts`   | Port implementation / Implementation     | Infrastructure               |
| `.dal.ts`       | Raw Data Access Logic (DB/API)           | Infrastructure               |
| `.mapper.ts`    | Data translation between layers          | Application / Infrastructure |
| `.factory.ts`   | Dependency injection / Wiring            | Infrastructure               |
| `.record.ts`    | Persistence/Database row shape           | Infrastructure               |
| `.output.ts`    | Data payload of a use case/workflow      | Application (Use Cases)      |
| `.event.ts`     | Domain or System event fact              | Domain / Application         |
| `.tokens.ts`    | Dependency injection tokens/constants    | Module Root                  |
| `.use-case.ts`  | Single business capability               | Application (Use Cases)      |
| `.workflow.ts`  | Multi-step orchestration helper          | Application (Use Cases)      |
| `.action.ts`    | Next.js Server Action                    | Interface Adapters           |

## Implementation vs. Contract Naming

To ensure Dependency Inversion is obvious and clean:

- **Contracts (Interfaces)**: Must use the `.contract.ts` suffix and `Contract` PascalCase suffix (e.g., `SessionServiceContract`).
- **Adapters (Classes)**: Must use the `.adapter.ts` suffix. The class name should reflect the technology (e.g., `CookieSessionAdapter`).
- **Dependency Injection**: Use the name of the contract (minus the suffix) for member variables (e.g., `private readonly sessionService: SessionServiceContract`). - Keep dependency names **consumer-centric**: prefer `SessionServiceContract` over implementation-leaky names like `CookieSessionContract`. - Avoid using `adapter`, `cookie`, `pg`, etc. in **Application-layer** dependency variable names (e.g., prefer `sessionService`, not `cookieSessionAdapter`).

  ## Type Naming
  - **PascalCase** for types (`UserId`, `SessionClaims`, `LoginCredentialsDto`).
  - **Integration scoping**: mention the integration/driver when the type is not generic or is tied to a specific system (e.g., `PgErrorMetadata` vs `ErrorMetadataValue`).

## Function Naming: Verb Vocabulary

| Verb         | Usage                                                            | Example            |
| :----------- | :--------------------------------------------------------------- | :----------------- |
| `toX`        | Pure mapping/transformation (no side effects)                    | `toHttpPayload`    |
| `normalizeX` | Converting foreign/unsafe input to canonical shape               | `normalizePgError` |
| `extractX`   | Pulling info out of unknown values (returns `undefined` if fail) | `extractMetadata`  |
| `makeX`      | Simple factory/constructor for objects                           | `makeAppError`     |
| `isX`        | Type guards (returns boolean)                                    | `isAppError`       |
| `hasX`       | Metadata/capability checks                                       | `hasMetadata`      |
| `getX`       | Safe, side-effect-free access                                    | `getFieldErrors`   |

- **Avoid**: `mapX` (prefer `toX`), `convertX`, and redundant suffixes like `XFactory` (prefer `makeX`).

## Revised Naming Principles

1. **Consistency Over Strict Suffixes**: If an object is treated as a "Service" by its consumers (Use Cases/Workflows), its contract and dependency name should reflect that, even if it eventually adapts to an external system.
2. **Consumer-Centric Naming**: Use Cases should depend on "Services" or "Repositories." "Adapter" is an implementation detail belonging to the Infrastructure layer.
3. **Domain-Aligned Verbs**: Ensure method names in contracts match the language used in the business logic (e.g., `terminate` instead of `logout`).
4. **Helper Isolation**: Helpers (`.helper.ts`) should be used for cross-cutting orchestration that is too complex for a single Use Case but doesn't warrant a full Service.
