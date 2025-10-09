# Result Module

Type-safe result and error modeling utilities for synchronous, asynchronous, and iterable flows.

---

| File                            | Function Signature                                                                                                                 | Description                                                                   |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------|
| error.ts                        | normalizeUnknownError(e: unknown): AppError                                                                                        | Converts any unknown error into a normalized `AppError`.                      |
| result.ts                       | Ok<TValue, TError>(value: TValue): Result<TValue, TError>                                                                          | Wraps a value in a successful `Result`.                                       |
| result.ts                       | Err<TValue, TError>(error: TError): Result<TValue, TError>                                                                         | Wraps an error in a failed `Result`.                                          |
| async/result-async.ts           | tryCatchAsync<TValue, TError>(fn: () => Promise<TValue>, mapError?): Promise<Result<TValue, TError>>                               | Executes an async function and wraps its result in a `Result`.                |
| async/result-async.ts           | fromNullableAsync<TValue, TError>(v: TValue \| null \| undefined, onNull): Promise<Result<TValue, TError>>                         | Wraps a nullable async value in a `Result`.                                   |
| async/result-async.ts           | fromPredicateAsync<TValue, TError>(value: TValue, predicate, onFail): Promise<Result<TValue, TError>>                              | Wraps a value in a `Result` based on an async predicate.                      |
| async/result-map-async.ts       | mapAsync<TValue, TError, TNext>(result: Result<TValue, TError>, fn: (v: TValue) => Promise<TNext>): Promise<Result<TNext, TError>> | Maps a successful async `Result` to a new value.                              |
| async/result-tap-async.ts       | tapAsync<TValue, TError>(result: Result<TValue, TError>, fn: (v: TValue) => Promise<void>): Promise<Result<TValue, TError>>        | Runs a side-effect on a successful async `Result` without changing its value. |
| async/result-transform-async.ts | transformAsync<TValue, TError, TNext, TNextError>(result: Result<TValue, TError>, onOk, onErr): Promise<Result<TNext, TNextError>> | Transforms both success and error cases of an async `Result`.                 |
| iter/result-collect-iter.ts     | collectIter<TValue, TError>(results: Iterable<Result<TValue, TError>>): Result<readonly TValue[], TError>                          | Collects an iterable of `Result`s into a single `Result` of an array.         |
| sync/result-collect.ts          | collect<TValue, TError>(results: readonly Result<TValue, TError>[]): Result<readonly TValue[], TError>                             | Collects an array of `Result`s into a single `Result` of an array.            |
| sync/result-map.ts              | map<TValue, TError, TNext>(result: Result<TValue, TError>, fn: (v: TValue) => TNext): Result<TNext, TError>                        | Maps a successful `Result` to a new value.                                    |
| sync/result-match.ts            | match<TValue, TError, TReturn>(result: Result<TValue, TError>, onOk, onErr): TReturn                                               | Pattern-matches on a `Result`, handling both success and error cases.         |
| sync/result-sync.ts             | tryCatch<TValue, TError>(fn: () => TValue, mapError?): Result<TValue, TError>                                                      | Executes a synchronous function and wraps its result in a `Result`.           |
| sync/result-sync.ts             | fromNullable<TValue, TError>(v: TValue \| null \| undefined, onNull): Result<TValue, TError>                                       | Wraps a nullable value in a `Result`.                                         |
| sync/result-sync.ts             | fromPredicate<TValue, TError>(value: TValue, predicate, onFail): Result<TValue, TError>                                            | Wraps a value in a `Result` based on a predicate.                             |
| sync/result-tap.ts              | tap<TValue, TError>(result: Result<TValue, TError>, fn: (v: TValue) => void): Result<TValue, TError>                               | Runs a side-effect on a successful `Result` without changing its value.       |
| sync/result-transform.ts        | transform<TValue, TError, TNext, TNextError>(result: Result<TValue, TError>, onOk, onErr): Result<TNext, TNextError>               | Transforms both success and error cases of a `Result`.                        |
