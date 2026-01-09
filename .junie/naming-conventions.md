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

- **Policies (`.policy.ts`)** represent the logic/rules (The "Brain").
- **Contracts (`.contract.ts`)** represent the interface for side-effects or external capabilities (The "Hands").

5. **Reduce Synonym Drift**: Stick to the standard verb vocabulary to keep the codebase predictable.

---

## File and Folder Naming

- **Files**: Use **kebab-case**. Filename must match the **primary export** (e.g., `to-pg-error.ts` exports `toPgError`).
- **Folders**: Use **nouns** (e.g., `catalog/`, `factories/`, `utils/`).
- **One Concept Per File**: Avoid `*.types.ts` files. Split types into files reflecting their role.

### Boundary-Explicit Suffixes

Use these suffixes for types and files to indicate their role in the architecture:

To avoid "dumping grounds" like `*.types.ts`, use suffixes that indicate the type's role and boundary.

    **Guidelines:**

- **No `*.types.ts` files.** If you have one, split it based on the table above.

| Suffix          | Meaning                                | Layer/Boundary     |
| :-------------- | :------------------------------------- | :----------------- |
| `.entity.ts`    | Stateful domain object (with identity) | Entities           |
| `.value.ts`     | Value object / Branded primitive       | Entities           |
| `.policy.ts`    | Interface for business rules/logic     | Entities           |
| `.schema.ts`    | Zod/Validation schema                  | Entities ↔ App     |
| `.dto.ts`       | Stable data transfer object            | Use Cases          |
| `.transport.ts` | Wire/HTTP/Cookie-only shape            | Interface Adapters |
| `.view.ts`      | Server → Client UI shape               | UI Boundary        |
| `.contract.ts`  | Dependency boundary interface          | Use Cases          |
| `.adapter.ts`   | Port implementation / Implementation   | Infrastructure     |
| `.dal.ts`       | Raw Data Access Logic (DB/API)         | Infrastructure     |
| `.mapper.ts`    | Data translation between layers        | Infrastructure/App |
| `.factory.ts`   | Dependency injection / Wiring          | Infrastructure     |
| `.record.ts`    | Persistence/Database row shape         | Infrastructure     |
| `.output.ts`    | Data payload of a use case/workflow    | Use Cases          |
| `.event.ts`     | Domain or System event fact            | Entities / App     |
| `.tokens.ts`    | Dependency injection tokens/constants  | Module Root        |
| `.use-case.ts`  | Single business capability             | Use Cases          |
| `.action.ts`    | Next.js Server Action                  | Interface Adapters |
| `.workflow.ts`  | Multi-step orchestration               | Use Cases          |

## Implementation vs. Contract Naming

To ensure Dependency Inversion is obvious and clean:

- **Contracts (Interfaces)**: Must use the `.contract.ts` suffix and `Contract` PascalCase suffix. Use consumer-centric names (e.g., `SessionServiceContract` instead of `SessionAdapterContract`).
- **Adapters (Classes)**: Must use the `.adapter.ts` suffix. The class name should reflect the technology or implementation detail (e.g., `CookieSessionAdapter` or `PgUserRepositoryAdapter`).
- **Dependency Injection**: Use the name of the contract (minus the suffix) for member variables (e.g., `private readonly sessionService: SessionServiceContract`). Avoid using `adapter` in variable names within the Application layer.

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

- **Avoid**: `mapX` (unless between equal representations), `convertX`, `createXFactory` (redundant).

## File Organization

- **Prefixing**: Boundary files (DTOs, Schemas, Transports) should be named after the **action** or **concept**, not just the module (e.g., `login-credentials.schema.ts` instead of `auth-user.schema.ts`).

## Type Naming

- Use **PascalCase**.
- **Integration Scoping**: Mention the integration if the type is not generic (e.g., `PgErrorMetadata` vs `ErrorMetadataValue`).

## Revised Naming Principles

1. Consistency Over Strict Suffixes: If an object is treated as a "Service" by its consumers (Use Cases/Workflows), its contract and dependency name should reflect that, even if it eventually adapts to an external system.
2. Consumer-Centric Naming: Use Cases should depend on "Services" or "Repositories." "Adapter" is an implementation detail belonging to the Infrastructure layer.
3. Domain-Aligned Verbs: Ensure method names in contracts match the language used in the business logic (e.g., terminate vs logout).
