---
apply: always
---

# Always-On AI Rules (Lite)

## Minimal Response Rule

- **Responses should be brief** and only include the **changed sections of code** or additions.
- Do **not** repeat the entire file unless explicitly requested.
- Use **diff-style or snippet-style output** showing context ±2 lines for clarity.
- Include any **new imports or types** only if they are part of the change.
- Provide a **short comment above the snippet** if needed to explain the purpose of the change.
- Avoid explanatory text or rationale unless the user asks for it.
- When multiple changes are suggested, **group them by file** and only include the affected lines per file.

## Core Principles

- Never use barrel files; never use index files.
- Enforce **maximum type safety** and **zero unsafe narrowing**, except `exactOptionalPropertyTypes`, which may remain
  disabled for practical flexibility in optional object fields.
- Follow strict, explicit typing. **Never use `any`** or implicit inference in exports.
- Prefer `satisfies` over `as`; Allow casts **only for primitives** (string, number, boolean).
- All exported functions/components/hooks must have explicit top-level parameter and return types.
- Internal closures and callbacks may rely on safe inference when fully constrained by generics.
- Export all symbols with explicit types when inference is ambiguous; prefer named exports; no default exports.
- Model null/undefined explicitly; no non-null assertions.
- Use discriminated unions for all errors/results (`{ ok: true; value } | { ok: false; error }`).
- Inputs immutable; use `readonly` and `as const`.
- Prefer small, composable changes.

## Document Hierarchy

- This file is always-on. Downstream rule documents must not repeat these rules; they should add only deltas or examples
  and link back.
- When conflicts arise, stop process and ask me how to proceed.

## Coding & Style

### File Conventions

- File length ≤200 lines; split by feature/domain.
- Avoid dumping grounds (e.g., utils.ts); prefer small, named modules.
- Use type-only imports for types.
- Place local functions above exported functions.

### Function Conventions

- Functions single-purpose, ≤50 lines, ≤4 parameters (optional in objects).
- Extract predicates/utilities; avoid deep nesting; cyclomatic complexity ≤15.
- Extract magic numbers/strings as constants.
- Separate validation, transformation, side-effects into dedicated functions.
- Prefer standard utility types; avoid unnecessary custom wrappers.

### Naming Conventions

- Use descriptive names; avoid abbreviations.

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

Respect this strict upward dependency flow:

```

shared --> ui --> shell --> app --> features --> server 

```

Rules:

- Lower layers **must not** import from higher ones.
- `shared` may be imported by any layer.
- `ui` is purely client-side; no server or DB logic.
- Keep functions short (<50 lines) and focused on a single concern.
- Group by **feature/domain** rather than technical type.

## Behavior & Safety

- Confirm intent before destructive or cross-layer edits.
- Prefer small, composable changes with explicit typing and safe defaults.
- Apply strictest interpretation if uncertain.

_Last updated: 2025-10-08_
