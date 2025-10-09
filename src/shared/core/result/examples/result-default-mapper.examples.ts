/**
 * Examples: keep NotFoundError instead of auto‑normalizing to AppError
 *
 * Your helpers default to AppError only when you omit a mapper.
 * That’s by design so UI/adapters can safely normalize unknown exceptions.
 * In lower layers (DAL/Repo/Service), always pass a mapper or error factory to keep domain errors like NotFoundError.
 * The generic types already support this; using a mapper prevents widening to AppError.
 */
/** biome-ignore-all lint/correctness/noUnusedVariables: <ignore> */

import { NotFoundError } from "@/shared/core/errors/domain/domain-errors";
import { tapErrorAsyncSafe } from "@/shared/core/result/async/result-tap-async";
import type { Result } from "@/shared/core/result/result";
import { fromNullable, tryCatch } from "@/shared/core/result/sync/result-sync";
import { tapOkSafe } from "@/shared/core/result/sync/result-tap";

// 1) tryCatch: provide a mapper → Result<T, NotFoundError>
const r1: Result<string, NotFoundError> = tryCatch<string, NotFoundError>(
  () => {
    // synchronous work that may throw NotFoundError or something else
    throw new NotFoundError("user missing", { id: "u_123" });
  },
  (e) =>
    e instanceof NotFoundError ? e : new NotFoundError("read failed", {}, e),
);

// 2) fromNullable: return your domain error via factory
const maybeUser: { id: string } | null = null;
const r2 = fromNullable<{ id: string }, NotFoundError>(
  maybeUser,
  () => new NotFoundError("User not found", { id: "u_123" }),
); // Result<{ id: string }, NotFoundError>

// 3) tapOkSafe: pass a mapper so side‑effect failures stay NotFoundError
const keepNotFoundSideEffect = tapOkSafe<
  { id: string },
  NotFoundError,
  NotFoundError
>(
  (u) => {
    // may throw anything
    if (!u.id) {
      throw new Error("bad state");
    }
  },
  (e) =>
    e instanceof NotFoundError
      ? e
      : new NotFoundError("side‑effect failed", {}, e),
);
const r3 = keepNotFoundSideEffect(r2); // Result<..., NotFoundError>

// 4) tapErrorAsyncSafe: async side‑effect on Err, mapped to NotFoundError
const onErrNotify = tapErrorAsyncSafe<unknown, NotFoundError, NotFoundError>(
  async (_e) => {
    // may throw; mapper ensures NotFoundError
    await Promise.resolve();
    throw new Error("notification failed");
  },
  (e) =>
    e instanceof NotFoundError ? e : new NotFoundError("notify failed", {}, e),
);
// usage: await onErrNotify(r3);

// Note:
// - Using tapOk/tapError (non‑Safe variants) never changes the error type.
// - The default `normalizeUnknownError` in `'/src/shared/core/result/error.ts'` returns AppError;
//   you only get that when you call *Safe helpers without a mapper or use adapter‑layer utilities.
// - Follow the layering rule: only convert to AppError at the action/UI boundary; keep BaseError/NotFoundError below.
