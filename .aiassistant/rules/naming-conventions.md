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

## File and Folder Naming

- **Files**: Use **kebab-case**. Filename must match the **primary export** (e.g., `to-pg-error.ts` exports `toPgError`).
- **Folders**: Use **nouns** (e.g., `catalog/`, `factories/`, `utils/`).
- **One Concept Per File**: Avoid `*.types.ts` files. Split types into files reflecting their role.

### Boundary-Explicit Suffixes

Use these suffixes for types and files to indicate their role in the architecture:

To avoid "dumping grounds" like `*.types.ts`, use suffixes that indicate the type's role and boundary.

    **Guidelines:**

- **No `*.types.ts` files.** If you have one, split it based on the table above.

| Suffix          | Meaning                                | Layer/Boundary |
| :-------------- | :------------------------------------- | :------------- |
| `.entity.ts`    | Stateful domain object (with identity) | Domain         |
| `.value.ts`     | Value object / Branded primitive       | Domain         |
| `.policy.ts`    | Interface for business rules/logic     | Domain         |
| `.schema.ts`    | Zod/Validation schema                  | Domain ↔ App   |
| `.dto.ts`       | Stable data transfer object            | App / Shared   |
| `.transport.ts` | Wire/HTTP/Cookie-only shape            | Adapter        |
| `.view.ts`      | Server → Client UI shape               | UI Boundary    |
| `.port.ts`      | Dependency boundary interface          | Application    |
| `.record.ts`    | Persistence/Database row shape         | Infrastructure |
| `.command.ts`   | Input for a use case/workflow          | Application    |
| `.output.ts`    | Data payload of a use case/workflow    | Application    |
| `.event.ts`     | Domain or System event fact            | Domain / App   |
| `.tokens.ts`    | Dependency injection tokens/constants  | Module Root    |

| `.use-case.ts` | Single business capability | Application |
| `.action.ts` | Next.js Server Action | Adapter |
| `.workflow.ts` | Multi-step orchestration | Application |

## Function Naming: Verb Vocabulary

| Verb         | Usage                                                            | Example            |
| :----------- | :--------------------------------------------------------------- | :----------------- |
| `toX`        | Pure mapping/transformation (no side effects)                    | `toHttpPayload`    |
| `normalizeX` | Converting foreign/unsafe input to canonical shape               | `normalizePgError` |
| `extractX`   | Pulling info out of unknown values (returns `undefined` if fail) | `extractMetadata`  |
| `makeX`      | Factories constructing canonical objects                         | `makeAppError`     |
| `isX`        | Type guards (returns boolean)                                    | `isAppError`       |
| `hasX`       | Metadata/capability checks                                       | `hasMetadata`      |
| `getX`       | Safe, side-effect-free access                                    | `getFieldErrors`   |

- **Avoid**: `mapX` (unless between equal representations), `convertX`.

## Type Naming

- Use **PascalCase**.
- **Integration Scoping**: Mention the integration if the type is not generic (e.g., `PgErrorMetadata` vs `ErrorMetadata`).
