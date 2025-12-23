# Global Standards

General rules for API compatibility, code style, and project organization.

## Use Compatible APIs

- Use APIs compatible with Next.js v16+, React 19+, and TypeScript 5.9+.
- Avoid deprecated APIs (e.g., use `use` instead of older patterns where applicable).

## Code Style Consistency

- **Alphabetization**: Sort object literal properties, interfaces, and types alphabetically (matches Biome/ESLint configuration).
- **Explicit Typing**: Always explicitly type function arguments and return values. No `any`.
- **Documentation**: Use **TSDoc** for describing intent and business context.
  - Avoid repeating types in `@param` or `@returns` tags that are already defined in TypeScript.
  - Avoid JSDoc.
- **Imports**:
  - Avoid re-exports and barrel files (`index.ts`).
  - Use absolute paths with `@/` alias.

## Strict Data Integrity

Avoid "drift" caused by silent fallbacks or implicit defaults.

- **Discourage Defaults**: Do not provide default values for configuration or domain properties. If a value is required, the system should fail fast if it is missing.
- **No Fallbacks**: Avoid patterns like `const value = input ?? 'default'`. This masks upstream issues and leads to inconsistent state.
- **Validation over Defaulting**: Use Zod schemas to validate presence. If a field is optional, it must be explicitly handled as `undefined` or `null` throughout the flow.
- **Minimize Optional Properties**: Avoid optional properties in:
  - **Error Factories**
  - **Contexts**
  - **Metadata**
- **When Optional is Necessary**: If a property is genuinely optional:
  - Mark it explicitly in TypeScript (`property?: Type`) and Zod (`.optional()`).
  - Document why it's optional and how absent values are handled.
  - Never silently default; let `undefined` propagate or handle it explicitly at each usage site.

## Project Structure

Organize features using a Modular Hexagonal approach:

- **Global UI**: `@/ui` (Atoms, Molecules - Atomic Design).
- **Feature Modules**: `@/modules/{feature_name}`.
  - `shared/`: Logic used by both UI and Server (schemas, constants).
  - `server/`: Hexagonal core (Actions, Use Cases, Ports, Infrastructure).
  - `ui/`: Feature-specific components.
- **Shared Logic**: `@/shared/` (cross-cutting concerns like error handling, forms, and results).
- **Server-Only**: `@/server/` (global server utilities, e.g., database client, server config, cookies, crypto, db schema).

## Module Boundaries

- Feature modules should be self-contained "bounded contexts".
- Cross-module imports are only allowed from a module's `shared` or `ui` folders, or from the global `src/shared`.
- **Hard Rule**: Never import from another module's `server/**` directory.
