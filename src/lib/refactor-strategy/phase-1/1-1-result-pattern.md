# Phase 1

## 1.1 Result Pattern (`src/lib/core/`)

~~~typescript
// src/lib/core/result.ts

export type Result<T, E = Error> =
    | { readonly success: true; readonly data: T }
    | { readonly success: false; readonly error: E };

export const Ok = <T>(data: T): Result<T, never> =>
    ({ success: true, data }) as const;

export const Err = <E>(error: E): Result<never, E> =>
    ({ success: false, error }) as const;

export const unwrap = <T, E>(r: Result<T, E>): T => {
    if (r.success) return r.data;
    throw r.error;
};

// Type guards
export const isOk = <T, E>(r: Result<T, E>): r is { success: true; data: T } => r.success;
export const isErr = <T, E>(r: Result<T, E>): r is { success: false; error: E } => !r.success;

// Transformations
export const map =
    <T, U, E>(fn: (v: T) => U) =>
        (r: Result<T, E>): Result<U, E> =>
            r.success ? Ok(fn(r.data)) : r;

export const chain =
    <T, U, E1, E2>(fn: (v: T) => Result<U, E2>) =>
        (r: Result<T, E1>): Result<U, E1 | E2> =>
            r.success ? fn(r.data) : r;

export const mapError =
    <T, E1, E2>(fn: (e: E1) => E2) =>
        (r: Result<T, E1>): Result<T, E2> =>
            r.success ? r : Err(fn(r.error));

export const bimap =
    <T, U, E1, E2>(onOk: (v: T) => U, onErr: (e: E1) => E2) =>
        (r: Result<T, E1>): Result<U, E2> =>
            r.success ? Ok(onOk(r.data)) : Err(onErr(r.error));

// Matching
export const match = <T, E, U>(
    r: Result<T, E>,
    onOk: (v: T) => U,
    onErr: (e: E) => U,
): U => (r.success ? onOk(r.data) : onErr(r.error));
export const fold = match;

// Async helpers
export const tryCatch = <T, E = Error>(fn: () => T, mapError?: (e: unknown) => E): Result<T, E> => {
    try {
        return Ok(fn());
    } catch (e) {
        return Err(mapError ? mapError(e) : (e as E));
    }
};

export const fromPromise = async <T, E = Error>(
    p: Promise<T>,
    mapError?: (e: unknown) => E,
): Promise<Result<T, E>> => {
    try {
        return Ok(await p);
    } catch (e) {
        return Err(mapError ? mapError(e) : (e as E));
    }
};

// Utilities
export const tap =
    <T, E>(fn: (v: T) => void) =>
        (r: Result<T, E>): Result<T, E> => {
            if (r.success) fn(r.data);
            return r;
        };

export const tapError =
    <T, E>(fn: (e: E) => void) =>
        (r: Result<T, E>): Result<T, E> => {
            if (!r.success) fn(r.error);
            return r;
        };

export const all = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
    const acc: T[] = [];
    for (const r of results) {
        if (!r.success) return r;
        acc.push(r.data);
    }
    return Ok(acc);
};
~~~

### 1.1.1 Adapter to my ActionResult

- Use this at boundaries (e.g., server actions) to present a consistent shape:

~~~typescript
import type { ActionResult } from "@/lib/types/action-result";

export const toActionResult = <T>(
    r: Result<T, unknown>,
    successMessage = "OK",
    errorMessage = "Request failed",
): ActionResult<T> =>
    r.success
        ? { success: true, message: successMessage, errors: {}, data: r.data }
        : {
            success: false,
            message: errorMessage,
            errors: { _root: [r.error instanceof Error ? r.error.message : String(r.error)] },
        };
~~~
