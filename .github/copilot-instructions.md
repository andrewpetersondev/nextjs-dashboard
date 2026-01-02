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

Organize features using a **Modular Clean Architecture** approach:

- **Global UI**: `@/ui` (Atoms, Molecules - Atomic Design). Shared, stateless components.
- **Feature Modules**: `@/modules/{feature_name}` (Bounded Contexts).
  - `domain/`: Pure logic, no dependencies.
  - `application/`: Use cases, contracts, and DTOs.
  - `infrastructure/`: Implementations of contracts (repositories, adapters) and Server Actions.
  - `presentation/`: Feature-specific React components.
- **Shared**: `@/shared/` (cross-cutting concerns: error handling, functional `Result` types, Zod schemas).
- **Server**: `@/server/` (Global singletons: DB client, logger configuration).
- **Shell**: `@/shell/` (App-wide layout, providers, and global navigation).

## Module Boundaries & Communication

- **Isolation**: Modules should be self-contained. Avoid "feature-bleeding".
- **Cross-Module Imports**:
  - A module may import from another module's `domain` or `application/dtos`.
  - NEVER import from another module's `infrastructure` or `presentation` (except shared UI).
  - Use the `shared` directory for logic used by 3+ modules.
- **Communication**: Prefer asynchronous events (Domain Events) or simple service calls via contracts for cross-module interaction to maintain loose coupling.

## Server Action Responsibilities (Interface Adapters)

Server Actions must remain **thin** and framework-focused. They are the bridge between the Web (HTTP/Forms) and your Application logic.

- **Allowed Concerns**:
  - Extracting data from `FormData`.
  - Retrieving request metadata (IP, User Agent, Cookies).
  - Initializing observability (Request IDs, Performance Trackers).
  - Validating input schemas (via Zod/Form Helpers).
  - Invoking a **single** Use Case or Workflow.
  - Mapping Domain/Application Results to UI-compatible `FormResult`.
  - Triggering Next.js navigation (`redirect`, `revalidatePath`).
- **Forbidden Concerns**:
  - Direct Database queries (DAL/Drizzle).
  - Business logic or complex branching (move to Use Cases).
  - Manual password hashing or crypto logic.
  - Instantiating complex Infrastructure classes directly (use Factories).

## Module Boundaries

- Feature modules should be self-contained "bounded contexts".
- Cross-module imports are only allowed from a module's `shared` or `ui` folders, or from the global `src/shared`.
- **Hard Rule**: Never import from another module's `server/**` directory.
