/**
 * Below are minimal, typed examples showing where to pass a mapper (unknown → domain error) or
 * a factory (produce a domain error) so results keep NotFoundError instead of widening to AppError.
 */
/** biome-ignore-all lint/suspicious/useAwait: <ignore> */
/** biome-ignore-all lint/correctness/noUnusedVariables: <ignore> */
/** biome-ignore-all lint/nursery/noShadow: <ignore> */

import { NotFoundError } from "@/shared/core/errors/domain/domain-errors";
import { tryCatchAsync } from "@/shared/core/result/async/result-async";
import {
  tapErrorAsyncSafe,
  tapOkAsyncSafe,
} from "@/shared/core/result/async/result-tap-async";
import { makeErrorMapper } from "@/shared/core/result/error";
import type { Result } from "@/shared/core/result/result";
import {
  fromNullable,
  fromPredicate,
  tryCatch,
} from "@/shared/core/result/sync/result-sync";
import { tapErrorSafe, tapOkSafe } from "@/shared/core/result/sync/result-tap";

// Reusable mapper: unknown → NotFoundError
const toNotFoundError = makeErrorMapper<NotFoundError>({
  isTarget: (e): e is NotFoundError => e instanceof NotFoundError,
  toTarget: (e) => new NotFoundError("operation failed", {}, e),
});

// Example domain type
interface User {
  readonly id: string;
}

// 1) Mapper with tryCatch (sync) → Result<User, NotFoundError>
const getUserSync = (
  load: (id: string) => User,
  id: string,
): Result<User, NotFoundError> =>
  tryCatch<User, NotFoundError>(
    () => load(id),
    toNotFoundError, // mapper
  );

// 2) Mapper with tryCatchAsync (async) → Result<User, NotFoundError>
const getUserAsync = (
  load: (id: string) => Promise<User>,
  id: string,
): Promise<Result<User, NotFoundError>> =>
  tryCatchAsync<User, NotFoundError>(() => load(id), {
    mapError: toNotFoundError,
  }); // mapper

// 3) Factory with fromNullable → Result<User, NotFoundError>
const ensureUserPresent = (
  u: User | null,
  id: string,
): Result<User, NotFoundError> =>
  fromNullable<User, NotFoundError>(
    u,
    () => new NotFoundError("User not found", { id }),
  ); // factory

// 4) Factory with fromPredicate → Result<User, NotFoundError>
const ensureValidUser = (u: User): Result<User, NotFoundError> =>
  fromPredicate<User, NotFoundError>(
    u,
    (x) => Boolean(x.id),
    () => new NotFoundError("User invalid", {}),
  ); // factory

// 5) Mapper with tapOkSafe (sync side-effect) → keeps NotFoundError
const auditOnOk = tapOkSafe<User, NotFoundError, NotFoundError>(
  (u) => {
    // may throw
    if (!u.id) {
      throw new Error("missing id");
    }
  },
  toNotFoundError, // mapper
);

// 6) Mapper with tapErrorSafe (sync side-effect on Err)
const logOnErr = tapErrorSafe<User, NotFoundError, NotFoundError>(
  (_e) => {
    // may throw
    throw new Error("log failed");
  },
  toNotFoundError, // mapper
);

// 7) Mapper with tapOkAsyncSafe / tapErrorAsyncSafe (async side-effects)
const notifyOnOk = tapOkAsyncSafe<User, NotFoundError, NotFoundError>(
  async (_u) => {
    // may throw
    throw new Error("notify failed");
  },
  toNotFoundError, // mapper
);

const notifyOnErr = tapErrorAsyncSafe<User, NotFoundError, NotFoundError>(
  async (_e) => {
    // may throw
    throw new Error("notify failed");
  },
  toNotFoundError, // mapper
);
