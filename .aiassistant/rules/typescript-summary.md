---
apply: always
---

# TypeScript Summary Rules

## Purpose

Guarantee strict, explicit, and maintainable TypeScript in all layers of the Next.js app.
Attach this when authoring, reviewing, or refactoring `.ts` / `.tsx` files.

---

## Compiler & Strictness

- tsconfig must enable: `"strict": true`, `"noImplicitAny": true`, `"noUncheckedIndexedAccess": true`, `"noImplicitOverride": true`.
- Prefer enabling: `"noFallthroughCasesInSwitch": true`, `"noPropertyAccessFromIndexSignature": true`, `"noErrorTruncation": true`.
- Allow type inference only inside function bodies; never for exported APIs (functions, components, classes, constants).

---

## Typing & Immutability

- Prefer `readonly` on arrays, tuples, and object properties where mutation isn’t required.
- Treat all inputs as immutable; never mutate parameters or shared objects.
- Mark constants with `as const` when used as discriminants or literal values.
- No non-null assertions (`!`). Narrow values safely with guards or predicates.
- Avoid deriving literal field lists via `Object.keys(...)` with casts; declare explicit readonly literal arrays and validate with `satisfies`.
- Use Zod typing correctly:
  - `z.input<typeof Schema>` for inbound/untrusted data (pre-parse).
  - `z.output<typeof Schema>` for validated/parsed data (post-parse).
  - Name aliases accordingly: `UserInput`, `UserData`.
- Prefer `satisfies` to ensure exactness without widening; avoid unnecessary `as` casts.

---

## Control Flow

- Prefer early returns over deep nesting.
- Use exhaustive `switch` on discriminated unions; add a `never` check for exhaustiveness.
- Extract complex conditions into well-named predicates.

---

## Casting

- Never cast with `as unknown as`.
- Prefer user-defined type guards and refinements over casts.
- If a cast is unavoidable, isolate it in a small, documented helper.

---

## Generics

- Name generics meaningfully: `TInput`, `TResult`, `TError`, `TPayload`, etc.
- Constrain generics (e.g., `extends object`, domain shapes) to limit misuse.
- Prefer default generics in adapter/edge layers.
- Avoid deep/recursive generics unless encapsulated and documented.
- Prefer options objects for optional generic behavior over boolean flags.

---

## Functions & Components

- Functions:
  - Max 4 parameters; prefer an options object for optional parameters.
  - Single-purpose, ≤ 50 lines; extract helpers for readability.
  - All exported functions declare explicit parameter and return types (async returns `Promise<TResult>`).
- React components and hooks:
  - Name components in `PascalCase`, hooks as `useCamelCase`.
  - Export named symbols only; no default exports.
  - Props are explicit interfaces/types; no inferred anonymous exports.

---

## Type Design

- Use `interface` for extensible public contracts; `type` for unions, tuples, and mapped types.
- Do not export inferred anonymous object types; export named types/interfaces.
- Prefer utility types (`Pick`, `Omit`, `Partial`, `Readonly`, `Record`) over ad-hoc redefinitions.
- Represent nullability explicitly with `T | null | undefined`—never implicit or via non-null assertions.

---

## Async & Concurrency

- Always declare explicit async return types: `Promise<TResult>`.
- Use `Promise.all` / `Promise.allSettled` for independent tasks; handle partial failures explicitly.
- Include `AbortController` for cancellable fetches; thread `signal` through layers.
- Avoid unhandled promise rejections; await or intentionally detach with rationale.

---

## Testing & Tooling

- Add type-level tests (e.g., `vitest` + `@ts-expect-error`) for critical contracts.
- Prefer runtime guards with Zod at boundaries; assert types only after parse/validate.
- Keep files ≤ 200 lines when practical; split by feature/domain rather than dumping utilities.

---

_Last updated: 2025-10-13_
