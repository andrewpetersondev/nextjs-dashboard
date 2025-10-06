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

- Never use barrel files.
- Follow strict, explicit typing. **Never use `any`** or implicit inference in exports.
- Allow casts **only for primitives** (string, number, boolean).
- Enforce **maximum type safety** and **zero unsafe narrowing**.
- All exported functions/components/hooks must have **explicit parameter and return types**.
- Model null/undefined explicitly; no non-null assertions.
- Use discriminated unions for all errors/results (`{ ok: true; value } | { ok: false; error }`).
- Inputs immutable; use `readonly` and `as const`.
- Confirm intent before destructive or cross-layer edits.
- Prefer small, composable changes; use `pnpm` commands in examples.

## Coding & Style

- Functions single-purpose, ≤50 lines, ≤4 parameters (optional in objects).
- File length ≤200 lines; split by feature/domain.
- Extract predicates/utilities; avoid deep nesting; cyclomatic complexity ≤15.
- Sort object properties by key; extract magic numbers/strings as constants.
- Export all symbols with explicit types; prefer named exports; no default exports.
- React: use functional components, explicit props/return types, typed event handlers.
- Separate validation, transformation, side-effects into dedicated functions.
- Avoid dumping grounds (e.g., utils.ts); prefer small, named modules.
- Avoid barrel files; use type-only imports for types.

## Layered Architecture

Respect this strict import and responsibility order:

```

app → action → service → repo → dal → server → shared → ui

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

_Last updated: 2025-10-06_
