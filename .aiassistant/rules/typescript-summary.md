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
- **No implicit any** anywhere. All exports must declare explicit parameter and return types.
- Allow type inference only inside function bodies; never for exported APIs.
- Use `import type` for all type-only imports.

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

- Use a discriminated union for all operations that can fail:
  ```ts
  type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
    ```

* Never rely on `try/catch` returning unknown types; map to a known error union.
* Catch `unknown`; narrow with predicates or `instanceof`.
* Normalize external/library errors into app-specific safe shapes.

---

## Functions & Components

* Functions: single-purpose, ≤50 lines, ≤4 parameters. Use an options object for optional args.
* Components and hooks: export explicit prop and return types.
* Type all event handlers and async functions (`Promise<T>`).
* Keep validation, transformation, and side-effects in separate helpers for testability.

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
2. Public exports have explicit parameter/return types.
3. No `any` or unsafe casts (except for primitives).
4. Generics named and constrained.
5. Async code has explicit Promise types and safe error handling.
6. Errors normalized to discriminated unions.
7. Null/undefined modeled explicitly; immutability maintained.
8. No server-only imports in client code; `import type` used for all type-only imports.

*Last updated: 2025-10-06*



