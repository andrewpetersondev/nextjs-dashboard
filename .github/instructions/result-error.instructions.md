---
applyTo: '**'
description: 'Result and error modeling, handling, and mapping guidelines for Next.js + TypeScript monorepo.'
---

# Result & Error Handling Summary

## Purpose

Keep strict, type-safe error handling with a dual-tier model.  
UI layers always use `AppError`; lower layers may use `BaseError`.  
Attach when editing `result.ts`, `error.ts`, or `fromPromise`.

---

## Best Practices

* No `try/catch` except around async boundaries.
* Never rethrow except at app exit.
* Only the adapter layer converts to `AppError`.
* Use literal `code` enums and freeze errors in dev.

---

## Result Type

```ts
export type Result<T, E> =
    | { readonly ok: true; readonly value: T }
    | { readonly ok: false; readonly error: E };

export const Ok = /* @__PURE__ */ <T>(value: T): Result<T, never> =>
    ({ok: true, value} as const);

export const Err = /* @__PURE__ */ <E extends ErrorLike>(error: E): Result<never, E> =>
    ({ok: false, error} as const);
````

---

## Error Model

```ts
export interface BaseError {
    readonly code: ErrorCode;
    readonly message: string;
    readonly context?: Readonly<Record<string, unknown>>;
}

export interface AppError {
    readonly code: ErrorCode;
    readonly message: string;
    readonly form?: Record<string, string>; // dense field map
}
```

* `BaseError`: internal/logging use, may include context or stack.
* `AppError`: lightweight, JSON-safe, UI displayable.
* Never cast to `any`; use `normalizeUnknownError()` adapter.

---

## Unified Adapter

```ts
export function toAppError(e: unknown): AppError {
    const b = normalizeUnknownError(e); // → BaseError
    return {code: b.code, message: b.message};
}

export async function fromPromise<T>(
    fn: () => Promise<T>,
): Promise<Result<T, AppError>> {
    try {
        return Ok(await fn());
    } catch (e) {
        return Err(toAppError(e));
    }
}
```

*(Integrate with `tryCatchAsync` if both exist.)*

---

## Layer Rules

| Layer   | Error Type | Strategy                                |
|---------|------------|-----------------------------------------|
| DAL     | BaseError  | Return `Err`, wrap unknown              |
| Repo    | BaseError  | Map DAL → domain                        |
| Service | BaseError  | Combine results, never throw            |
| Action  | AppError   | Use adapter, return UI-safe `Result`    |
| UI/App  | AppError   | Read `result.ok`, map via `ERROR_CODES` |

---




Perfect — here’s a minimal **reference + guidance** addition for your markdown that explains when and why to promote
`BaseError` → `AppError` without bloating it:

---

## Promoting BaseError → AppError

- Only convert at **server action boundaries** or anywhere UI-facing results are returned.
- Use the adapter: `toAppError(baseErrorOrUnknown)`.
- Rationale:
    - Keeps UI layers JSON-safe and simple.
    - Preserves canonical error codes (`ERROR_CODES`) for user-friendly messages.
    - Internal layers continue to use `BaseError` with full context for logging/debugging.
- Example:

```ts
import {fromPromise} from "@/shared/core/result/from-promise";
import {toAppError} from "@/shared/core/errors/error-adapters";

export const doAction = async (): Promise<Result<User, AppError>> =>
    fromPromise(async () => await repo.createUser(), toAppError);
````

* **Tip:** Send the unmodified `BaseError.message` or stack to server logs, and use the mapped `AppError.message` for
  forms/UI.

*Last updated: 2025-10-06*
