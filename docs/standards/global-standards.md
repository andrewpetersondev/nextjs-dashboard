# Global Standards

General rules for API compatibility, code style, and project organization.

## Use Compatible APIs

- Use APIs compatible with Next.js v16+, React 19+, and TypeScript 5.9+.
- Avoid deprecated APIs (e.g., use `use` instead of older patterns where applicable).

## Code Style Consistency

- **Alphabetization**: Sort object literal properties, interfaces, and types alphabetically (matches Biome/ESLint
  configuration).
- **Explicit Typing**: Always explicitly type function arguments and return values. No `any`.
- **Documentation**: Use **TSDoc** for describing intent and business context.
  - Avoid repeating types in `@param` or `@returns` tags that are already defined in TypeScript.
  - Avoid JSDoc.
- **Imports**:
  - Avoid re-exports and barrel files (`index.ts`).
  - Use absolute paths with `@/` alias.

## Strict Data Integrity

Avoid "drift" caused by silent fallbacks or implicit defaults.

- **Discourage Defaults**: Do not provide default values for configuration or domain properties. If a value is required,
  the system should fail fast if it is missing.
- **No Fallbacks**: Avoid patterns like `const value = input ?? 'default'`. This masks upstream issues and leads to
  inconsistent state.
- **Validation over Defaulting**: Use Zod schemas to validate presence. If a field is optional, it must be explicitly
  handled as `undefined` or `null` throughout the flow.
- **Minimize Optional Properties**: Avoid optional properties in:
  - **Error Factories**
  - **Contexts**
  - **Metadata**
- **When Optional is Necessary**: If a property is genuinely optional:
  - Mark it explicitly in TypeScript (`property?: Type`) and Zod (`.optional()`).
  - Document why it's optional and how absent values are handled.
  - Never silently default; let `undefined` propagate or handle it explicitly at each usage site.

## Project Structure

Features are organized as **Modular Clean Architecture** vertical slices. Which top-level directory
a file belongs to — and which may import which — is owned by
[project-structure.md](../project-structure.md); the layering inside a module is owned by
[clean-architecture-standards.md](clean-architecture-standards.md). This doc does not restate
either.

## Module Boundaries & Communication

- **Isolation**: Modules should be self-contained. Avoid "feature-bleeding".
- **Cross-Module Imports**:
  - A module may import from another module's `domain` or `application/dtos`.
  - NEVER import from another module's `infrastructure` or `presentation` (except shared UI).
  - Use the `shared` directory for logic used by 3+ modules.
- **Communication**: Prefer asynchronous events (Domain Events) or simple service calls via contracts for cross-module
  interaction to maintain loose coupling.

What a Server Action may and may not do, and which layers may reach `@/server/**`, are layer rules —
see [clean-architecture-standards.md](clean-architecture-standards.md).
