# Result Module

Type-safe result and error modeling utilities for synchronous, asynchronous, and iterable flows.

---

| File                            | Function Signature                                                                                   | Description                                                    |
|---------------------------------|------------------------------------------------------------------------------------------------------|----------------------------------------------------------------|
| app-error.ts                    | normalizeUnknownError(e: unknown): AppError                                                          | Converts any unknown error into a normalized `AppError`.       |
| result.ts                       | Ok<TValue, TError>(value: TValue): Result<TValue, TError>                                            | Wraps a value in a successful `Result`.                        |
| result.ts                       | Err<TValue, TError>(error: TError): Result<TValue, TError>                                           | Wraps an error in a failed `Result`.                           |
| async/result-async.ts           | tryCatchAsync<TValue, TError>(fn: () => Promise<TValue>, mapError?): Promise<Result<TValue, TError>> | Executes an async function and wraps its result in a `Result`. |
| async/result-async.ts           | fromPromiseThunk<T>(fn: () => Promise<T>, mapError): Promise<Result<T, E>>                           | Executes a Promise-returning thunk and maps errors.            |
| async/result-async.ts           | fromPromise<T>(p: Promise<T>, mapError): Promise<Result<T, E>>                                       | Executes a Promise and maps errors.                            |
| async/result-async.ts           | toPromiseOrThrow<T>(r: Result<T, E>): Promise<T>                                                     | Converts a `Result` to a Promise, rejecting on error.          |
| async/result-map-async.ts       | mapOkAsync(fn): (r) => Promise<Result<Next, E>>                                                      | Maps Ok branch with async fn.                                  |
| async/result-map-async.ts       | mapOkAsyncSafe(fn, mapError?): (r) => Promise<Result<Next, E \| Side>>                               | Safe async Ok mapper (catches exceptions).                     |
| async/result-map-async.ts       | mapErrorAsync(fn): (r) => Promise<Result<T, NewE>>                                                   | Async error mapping (replacement).                             |
| async/result-map-async.ts       | mapErrorAsyncSafe(fn, mapError?): (r) => Promise<Result<T, NewE \| Side>>                            | Safe async error mapping (catches exceptions).                 |
| async/result-transform-async.ts | flatMapAsync(fn): (r) => Promise<Result<Next, E1 \| E2>>                                             | Async flatMap for Ok branch.                                   |
| async/result-transform-async.ts | flatMapAsyncPreserveErr(fn): (r) => Promise<Result<Next, E1 \| E2>>                                  | Async flatMap that preserves Err (no casting).                 |
| async/result-transform-async.ts | flatMapAsyncSafe(fn, mapError?): (r) => Promise<Result<Next, E1 \| E2 \| Side>>                      | Safe async flatMap (catches exceptions).                       |
| iter/result-collect-iter.ts     | collectAllLazy(iterable): Result<readonly T[], E>                                                    | Collects an iterable of Results.                               |
| sync/result-collect.ts          | collectAll(results): Result<readonly T[], E>                                                         | Collects an array of Results.                                  |
| sync/result-collect.ts          | collectTuple(...results): Result<Tuple, E>                                                           | Collects homogeneous tuple of Results.                         |
| sync/result-collect.ts          | collectTupleHetero(...results): Result<Tuple, UnionE>                                                | Collects heterogeneous tuple of Results.                       |
| sync/result-collect.ts          | firstOkOrElse(onEmpty)(results): Result<T, E>                                                        | Returns first Ok or last Err or onEmpty().                     |
| sync/result-map.ts              | mapOk(fn): (r) => Result<Next, E>                                                                    | Maps Ok branch (sync).                                         |
| sync/result-map.ts              | mapError(fn): (r) => Result<T, NewE>                                                                 | Maps error branch (replacement).                               |
| sync/result-map.ts              | mapErrorUnion(fn): (r) => Result<T, E1 \| E2>                                                        | Widens error type (union).                                     |
| sync/result-map.ts              | mapErrorUnionPreserve(fn): (r) => Result<T, E1 \| E2>                                                | Union-mapping with identity-preserve optimization.             |
| sync/result-map.ts              | mapErrorPreserve(fn): (r) => Result<T, E1 \| E2>                                                     | Preserve original Err when mapped equals original.             |
| sync/result-match.ts            | matchResult(r, onOk, onErr): Out                                                                     | Exhaustive matcher.                                            |
| sync/result-match.ts            | unwrapOrThrow(r): T                                                                                  | Unwraps or throws.                                             |
| sync/result-match.ts            | unwrapOr(fallback)(r): T                                                                             | Unwraps or returns constant.                                   |
| sync/result-match.ts            | unwrapOrElse(fallbackFn)(r): T                                                                       | Unwraps or returns computed fallback.                          |
| sync/result-sync.ts             | tryCatch(fn, mapError?): Result<T, E>                                                                | Executes a sync function and wraps result.                     |
| sync/result-sync.ts             | fromNullable(v, onNull): Result<T, E>                                                                | Wraps nullable value.                                          |
| sync/result-sync.ts             | fromPredicate(value, predicate, onFail): Result<T, E>                                                | Wraps value based on predicate.                                |
