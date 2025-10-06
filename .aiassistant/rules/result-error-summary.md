---
apply: manually
---

# Result & Error Handling Summary

## Purpose

Ensure strict, predictable, type-safe error and result handling across all layers.  
Attach when refactoring `result.ts`, `error.ts`, or functions that return `Result<T, E>`.

---

## Result Type Convention

Use **discriminated unions** only — never nullable or exceptions for control flow.

```ts
export type Result<T, E> =
    | { readonly ok: true; readonly value: T }
    | { readonly ok: false; readonly error: E };
````

Factory helpers:

```ts
export const Ok = /* @__PURE__ */ <T>(value: T): Result<T, never> =>
    ({ok: true, value} as const);

export const Err = /* @__PURE__ */ <E extends ErrorLike>(error: E): Result<never, E> =>
    ({ok: false, error} as const);
```

---

## Error Model

### BaseError

```ts
export interface BaseError {
    readonly code: ErrorCode;
    readonly message: string;
    readonly context?: Readonly<Record<string, unknown>>;
}
```

All errors implement `ErrorLike extends BaseError`.
Never cast to `any`.
Use `normalizeUnknownError()` to safely convert thrown values to `ErrorLike`.

---

## Error Flow by Layer

| Layer   | Expected Errors                         | Unexpected Errors                         | Handling Strategy       |
|---------|-----------------------------------------|-------------------------------------------|-------------------------|
| DAL     | DB/IO errors → `Err({ code, message })` | Wrap unknowns via `normalizeUnknownError` | Return `Err`            |
| Repo    | Translate DAL errors to domain codes    | Pass unexpected upstream                  | Return `Result`         |
| Service | Combine or map results, no throw        | Return `Err` if failure                   | Return typed `Result`   |
| Action  | Convert `Err` to user-safe messages     | Log unexpected                            | Return UI-safe `Result` |
| UI/App  | Display mapped message                  | Never handle raw errors                   | Read `result.ok` only   |

---

## Mapping Utilities

```ts
export function mapError<T, E1, E2>(
    result: Result<T, E1>,
    fn: (e: E1) => E2,
): Result<T, E2> {
    return result.ok ? result : Err(fn(result.error));
}
```

---

## Promise Wrappers

```ts
export async function fromPromise<T, E extends ErrorLike>(
    fn: () => Promise<T>,
    mapError: (e: unknown) => E,
): Promise<Result<T, E>> {
    try {
        return Ok(await fn());
    } catch (e) {
        return Err(mapError(e));
    }
}
```

---

## Best Practices

* No `try/catch` unless wrapping for `Result`.
* Never rethrow except in `app` boundaries.
* Always prefer **explicit mapping** of error types.
* Use literal `code` enums (e.g., `"NOT_FOUND"`, `"VALIDATION"`, `"UNEXPECTED"`).
* Freeze error objects in dev builds for immutability.

*Last updated: 2025-10-06*
