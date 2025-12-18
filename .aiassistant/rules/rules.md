---
apply: always
---

## Use compatible APIs

- Use APIs compatible with Next.js v16+, React 19+, and TypeScript 5.9+.
- Avoid deprecated APIs.

## Keep code style consistent

- Sort object literal properties, interfaces, and types alphabetically (Biome style).
- Avoid re-exports and avoid barrel files.
- Explicitly type all function arguments and return values.
- Use TSDoc for describing intent and business context; avoid repeating types in @param tags that are already defined in TypeScript. Avoid JSDoc.

## Follow the project structure

- Organize features under `@/modules/{feature}/{shared,server,ui}`.
- Use Clean/Hexagonal Architecture.
- UI Organization:
  - Place global, reusable UI in `@/ui` using Atomic Design (atoms, molecules).
  - Place feature-specific UI in `@/modules/{feature}/ui` (can follow Atomic Design if complex, otherwise flat).

## Handle failures explicitly (Result-first)

### Classify failures

- Treat **expected failures** (validation issues, business-rule/policy violations, “not found”, “already exists”, etc.) as values.
- Treat **unexpected failures** (programmer errors, broken invariants, impossible states) as exceptions.

### Use Result for expected failures

- Use the Result pattern (`Ok`/`Err`) from `@/shared/result` for all expected failures.
- Return `Result` from DAL & repositories (infrastructure adapters) and never throw for expected failures.
- Compose and map `Result`s in services (application core), including mapping policy violations to domain/app errors.
- Unwrap `Result`s only at boundaries (e.g., Next.js actions) and translate outcomes into HTTP / UI responses.

### Throw only for unexpected failures

- Throw exceptions only for programmer errors or invariant violations.

## Model errors consistently

- Use and create error factories in `@/shared/errors/factories/app-error.factory`.
- Use error codes instead of custom error subclasses.
