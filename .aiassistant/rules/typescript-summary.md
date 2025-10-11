---
apply: always
---

# TypeScript Summary Rules

## Purpose

Guarantee strict, explicit, and maintainable TypeScript in all layers of the Next.js app.  
Attach this when authoring, reviewing, or refactoring `.ts` / `.tsx` files.

---

## Compiler & Strictness

- tsconfig must enable: `"strict": true`, `noImplicitAny`, `noUncheckedIndexedAccess`, `noImplicitOverride`.
- Allow type inference only inside function bodies; never for exported APIs.

---

## Typing & Immutability

- Prefer `readonly` if appropriate.
- Treat all inputs as immutable; never mutate parameters or shared objects.
- Mark constants with `as const` when used as discriminants or literal values.
- No non-null assertions (`!`). Narrow values safely with guards or predicates.

---

## Casting

- Never cast with `as unknown as`.

---

## Generics

- Name generics meaningfully (e.g., `TInput`, `TResult`, `TError`, `TPayload`, etc.).
- Constrain generics: `extends object`, `extends ErrorLike`, etc.
- Prefer setting default generics in adapter layers.
- Avoid deep or recursive generics unless encapsulated and documented.
- Prefer parameter objects for optional generics over boolean flags.

---

## Result & Error Handling

- See result-error-summary.md for the canonical Result/AppError model and adapters. This document does not duplicate
  those rules.

---

## Functions & Components

- Use an options object for optional parameters. Other function/component rules are defined in always-on.md.
- Limit to 3 overloads max (ideal: 1–2); if more needed, create a separate function for that use case.

---

## Type Design

* Use **interface** for extensible public contracts; **type** for unions, tuples, and mapped types.
* Do not export inferred anonymous object types; export named types/interfaces.
* Prefer utility types (`Pick`, `Omit`, `Partial`, etc.) over ad-hoc redefinitions.
* Represent nullability explicitly with `T | null | undefined`—never implicit.

---

## Async & Concurrency

* Always await async calls with explicit `Promise<TResult>` return types.
* Use `Promise.all` / `allSettled` for independent async tasks.
* Include `AbortController` for cancellable fetches; pass `signal` through layers.

---

_Last updated: 2025-10-11_



