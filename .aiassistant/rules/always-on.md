---
apply: always
---

# Always-On AI Rules (Lite)

## Minimal Response Rule

1. Keep responses concise; include only the changed or added code.
2. Always label each snippet with the filename using the provided snippet tag.
3. Do not include the entire file unless explicitly requested.
4. Use snippet-style output with ±5 lines of surrounding context.
5. Include new imports/types only if they are part of the change.
6. Optionally add a one-line comment above the snippet to explain the change.
7. Avoid extra explanation or rationale unless asked.
8. If multiple files are changed, group edits per file in separate snippets.
9. Do not use diff markers; show actual code with context.
10. Prefer ordered lists to unordered lists.

## Core Principles

- No barrel files; avoid index.ts/tsx entry re-exports.
- Maximize type safety; no unsafe narrowing. `exactOptionalPropertyTypes` may remain disabled for practical optional fields.
- No `any`; no implicit `any`; avoid implicit export typing.
- Prefer `satisfies` over `as`; use casts only as a last resort.
- All exported functions/components/hooks must declare explicit parameter and return types.
- Internal callbacks/closures may rely on inference when fully constrained by generics.
- Prefer local inference for internal variables; keep explicit types for all exports.
- Use named exports only; no default exports. Export symbols with explicit types when inference is ambiguous.
- Model `null`/`undefined` explicitly; no non-null (`!`) assertions.
- Represent outcomes with discriminated unions (e.g., `Success | Failure`).
- Treat inputs as immutable: use `readonly` and `as const`.
- Enforce `readonly` at the source (e.g., `as const`, `satisfies readonly ...`); avoid redundant consumer-side annotations.
- Prefer small, typed, reusable normalization helpers (e.g., `FormData -> Readonly<Record<string, string>>`) over casts.
- No ambient type patching; prefer module augmentation with tests when necessary.
- Keep error types serializable and logged structures JSON-safe.

## Governance and Precedence

This document is always-on. Downstream documents must not restate rules from this file; they may add only deltas, clarifications, or examples, and should link back here when referencing base rules.

### Precedence Order (highest → lowest)

1. current-focus.md
2. always-on.md (this document)
3. project-rules.md
4. typescript-rules.md
5. results-forms-errors.md (deprecated → split into results.md, forms.md, errors.md)
6. structure-summary.md

Tip: When in doubt, prefer the higher-precedence document.

### Conflict Resolution

- On detecting a conflict:
  1. Pause related work.
  2. Identify the higher-precedence rule.
  3. Document the conflict and chosen resolution briefly.
  4. Proceed only after confirmation or alignment.

## Coding & Style

### File Conventions

- File length ≤ 200 lines; split by feature/domain.
- Avoid dumping grounds (e.g., utils.ts); prefer small, named modules.
- Use type-only imports for types.
- Place local code above exported code.
- Co-locate tests and stories with their module when practical.

### Function Conventions

- Functions single-purpose, ≤ 50 lines, ≤ 4 parameters (optional in objects).
- Extract predicates/utilities; avoid deep nesting; cyclomatic complexity ≤ 15.
- Extract magic numbers/strings/regex as constants.
- Separate validation, transformation, and side-effects into dedicated functions.
- Prefer standard utility types; avoid unnecessary custom wrappers.
- All exported async functions return `Promise<...>` with explicit result types.

### Naming Conventions

- Use descriptive, domain-specific names; avoid abbreviations.
- Types/interfaces end with `Type`/`Props` only when clarifying role; otherwise prefer noun phrases (e.g., `User`, `UserProfile`).
- Boolean names read positively and start with `is/has/can/should` (e.g., `isAdmin`, `hasAccess`).
- Event handlers start with `on` and accept a typed event (e.g., `onSubmit`, `onChange`).
- Pure predicates start with `is/has` and return `boolean`.
- Functions are verb-first (e.g., `fetchUser`, `createSession`, `computeHash`).
- Constants are SCREAMING_SNAKE_CASE only for process/env or build-time flags; otherwise `camelCase` with `readonly` and `as const`.
- React components and hooks: `PascalCase` for components, `useCamelCase` for hooks.
- Files and folders: `kebab-case` for modules, `PascalCase` only for React components.
- Test files: `<name>.test.ts` or `<name>.spec.ts`.

## Layered Architecture

### Directory Structure

```

src/
├─ app/        → Next.js App Router (layouts, pages, routes)
├─ features/   → Domain logic, components, and types per feature
├─ server/     → Server-only logic: auth, db, repos, services, actions
├─ shared/     → Cross-cutting utilities, domain types, constants
├─ ui/         → Reusable UI primitives and client-only code
└─ shell/      → Dashboard and UI composition shells
```

Respect this strict dependency flow:

- shared: cannot import from other folders (ui, features, server, app)
- ui: may import from shared only
- features: may import from ui and shared
- server: may import from anywhere (shared, ui, features, app)
- app: may import from features, ui, shared, and server

Rules:

- `ui` is purely client-side; no server or DB logic.
- `server` is server-only; mark with `"use server"` when applicable.
- Group by feature/domain rather than technical type.
- Cross-feature imports must go through `shared` or server composition, not lateral feature-to-feature.

## Behavior & Safety

- Confirm intent before destructive or cross-layer edits.
- Prefer small, composable changes with explicit typing and safe defaults.
- Apply strictest interpretation if uncertain.
- Validate boundaries at entry points (e.g., schema-validate inputs in server actions/services).
- Log structured, JSON-safe errors; avoid leaking secrets in messages.

_Last updated: 2025-10-13_
