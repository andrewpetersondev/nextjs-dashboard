---
apply: always
---

# Always-On AI Rules (Lite)

## Instructions

- You are an expert TypeScript developer.
- Ask numbered questions only when clarification is required before a safe change.

## Minimal Response Rule

- **Responses should be brief** and only include the **changed sections of code** or additions.
- Do **not** repeat the entire file unless explicitly requested.
- Use **snippet-style output** showing context ±2 lines for clarity.
- Include any **new imports or types** only if they are part of the change.
- Provide a **short comment above the snippet** if needed to explain the purpose of the change.
- Avoid explanatory text or rationale unless the user asks for it.

## Core Principles

- Never use barrel files; never use index files.
- Enforce **maximum type safety** and **zero unsafe narrowing**, except `exactOptionalPropertyTypes`, which may remain
  disabled for practical flexibility in optional object fields.
- Follow strict, explicit typing. **Never use `any`** or implicit inference in exports.
- Prefer `satisfies` over `as`; rarely use casts.
- All exported functions/components/hooks must have explicit top-level parameter and return types.
- Internal closures and callbacks may rely on safe inference when fully constrained by generics.
- Prefer local inference for variables inside function bodies; keep explicit types for exports only.
- Export all symbols with explicit types when inference is ambiguous; prefer named exports; no default exports.
- Model null/undefined explicitly; no non-null assertions.
- Use discriminated unions for all errors/results (`SuccessBranch | FailureBranch`).
- Inputs immutable; use `readonly` and `as const`.
- Enforce `readonly` at the source (e.g., `as const` or `satisfies readonly ...`); avoid redundant consumer-side
  annotations.
- Avoid deriving literal field lists via `Object.keys(...)` with casts; declare explicit readonly literal arrays and
  validate with `satisfies`.
- Use Zod typing correctly: `z.input<typeof Schema>` for inbound/untrusted data, `z.output<typeof Schema>` for
  validated/parsed data; name aliases accordingly.
- Prefer small, typed, and reusable helpers for normalization (e.g., `FormData → Readonly<Record<string, string>>`)
  instead of unsafe
  casts.

## Document Hierarchy

- This file is always-on and has highest precedence. Downstream rule documents must not repeat these rules; they should
  add only deltas or examples and link back.
- Precedence order on conflict (highest to lowest):
    1) always-on.md
    2) project-rules.md
    3) typescript-summary.md
    4) result-error-summary.md
    5) structure-summary.md
    6) current-focus.md
    7) md-docs.md
- When conflicts arise, stop process and ask me how to proceed.

## Coding & Style

### File Conventions

- File length ≤200 lines; split by feature/domain.
- Avoid dumping grounds (e.g., utils.ts); prefer small, named modules.
- Use type-only imports for types.
- Place local code above exported code.

### Function Conventions

- Functions single-purpose, ≤50 lines, ≤4 parameters (optional in objects).
- Extract predicates/utilities; avoid deep nesting; cyclomatic complexity ≤15.
- Extract magic numbers/strings/regex as constants.
- Separate validation, transformation, side-effects into dedicated functions.
- Prefer standard utility types; avoid unnecessary custom wrappers.

### Naming Conventions

- Use descriptive names.
- Avoid abbreviations.

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
- Group by **feature/domain** rather than technical type.

## Behavior & Safety

- Confirm intent before destructive or cross-layer edits.
- Prefer small, composable changes with explicit typing and safe defaults.
- Apply strictest interpretation if uncertain.

_Last updated: 2025-10-11_
