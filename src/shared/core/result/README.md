# Result pattern

A small, type-safe success/error wrapper used across the codebase to make
failure explicit in return types instead of relying on `throw` / `try`-`catch`.

## Philosophy

`Result<TValue, TError>` is a discriminated union of `Ok` (success) and `Err`
(failure). Callers narrow on the `ok` flag, which forces the error case to be
handled:

- **Exhaustiveness** — TypeScript makes you check `ok` before reaching `.value`
  or `.error`.
- **Discoverability** — a function's return type states which errors it can
  produce.
- **Safety** — no unhandled exceptions from forgotten `catch` blocks.

## API

This module deliberately exposes a minimal surface. There is no barrel file —
import directly from the specific module:

| Import                                                    | From                                  | Purpose                                                            |
| -------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------- |
| `Ok`, `Err`, `unwrapOrNull`                              | `@/shared/core/result/result`         | Construct results; non-throwing unwrap to `value \| null`.        |
| `Result`, `OkResult`, `ErrResult`, `OkType`, `ErrType`   | `@/shared/core/result/result.dto`     | Types.                                                             |
| `safeExecute`                                            | `@/shared/core/result/safe-execute`   | Run an async thunk, converting thrown values into a logged `Err`. |

### Creating and reading results

```ts
import { makeUnexpectedError } from "@/shared/core/errors/core/factories/app-error.factory";
import { Err, Ok } from "@/shared/core/result/result";

const success = Ok(42);
const failure = Err(makeUnexpectedError(cause, { message: "Something failed" }));

// Narrow on the `ok` discriminant — there are no isOk/isErr helpers.
if (result.ok) {
  // result.value is available here
} else {
  // result.error is available here (always an AppError)
}
```

> `Err` accepts an `AppError` instance (a class built via the error factories in
> `@/shared/core/errors`), **not** a plain `{ code, message }` object.

### safeExecute

```ts
import { safeExecute } from "@/shared/core/result/safe-execute";

const result = await safeExecute(() => myDomainOperation(), {
  logger,
  message: "Failed to fetch user data",
  operation: "GetUserData",
});
```

A resolved `Ok`/`Err` is returned verbatim with no logging. A _thrown_ `AppError`
is logged and returned as-is; any other thrown value is normalized to an
`unexpected` `AppError` and logged.

## Dormant combinator modules

This module also ships a fuller combinator library that is **not currently
exported or imported by anything** — every function is module-private:

- `result.factory.ts` — constructors (`tryCatch`, `fromNullable`,
  `fromPredicate`, `fromGuard`, `fromCondition`, `tryCatchAsync`).
- `result.operators.ts` — sync transforms (`map`, `flatMap`, `mapErr`, `tap`,
  `unwrapOr` / `unwrapOrElse`, `match`, …).
- `result.async.ts` — async mirrors plus a typed multi-step `pipeAsync`.
- `result.collection.ts` — aggregation (`collectAll`, `collectTuple`,
  `firstOkOrElse`, `iterateOk`).

They're kept dormant as a ready-made foundation for railway-oriented error
handling, to be wired up (exported + tested) if and when a real caller needs
them. Until then they intentionally surface as unused files in `pnpm knip`. If
that day never comes, delete them — git preserves the full implementation.

## Tooling

- `pnpm biome:check` — lint/format diagnostics.
- `pnpm typecheck` — TypeScript checks.
```
