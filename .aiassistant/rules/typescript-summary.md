---
apply: manually
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

- Use `readonly` for arrays, tuples, and properties where possible.
- Treat all inputs as immutable; never mutate parameters or shared objects.
- Mark constants with `as const` when used as discriminants or literal values.
- No non-null assertions (`!`). Narrow values safely with guards or predicates.

---

## Generics

- Name generics meaningfully (e.g., `TInput`, `TResult`, `TError`).
- Constrain generics: `extends object`, `extends ErrorLike`, etc.
- Avoid deep or recursive generics unless encapsulated and documented.
- Prefer parameter objects for optional generics over boolean flags.

---

## Result & Error Handling

- See result-error-summary.md for the canonical Result/AppError model and adapters. This document does not duplicate
  those rules.

---

## Functions & Components

- Use an options object for optional parameters. Other function/component rules are defined in always-on.md.

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

## Enforcement Checklist

1. Strict tsconfig enabled and validated.
2. Generics named and constrained.
3. Async code has explicit Promise types and safe error handling.
4. No server-only imports in client code; use `import type` for all type-only imports.

*Last updated: 2025-10-08*



