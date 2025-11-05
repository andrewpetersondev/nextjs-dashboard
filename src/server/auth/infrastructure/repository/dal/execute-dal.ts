import "server-only";
import { toBaseErrorFromPgUnknown } from "@/server/auth/infrastructure/repository/dal/pg-error.mapper";
import type { BaseError } from "@/shared/core/errors/base/base-error";

type LogCtx = Readonly<{
  operation: string;
  context: string;
  identifiers: Readonly<Record<string, unknown>>;
}>;

function normalizeDalError(err: unknown, ctx: LogCtx): BaseError {
  const baseCtx = {
    context: ctx?.context,
    identifiers: ctx?.identifiers,
    operation: ctx?.operation,
  };
  // Keep a single normalization path; specialize inside mapper (unique, timeouts, etc.)
  return toBaseErrorFromPgUnknown(err, baseCtx);
}

/**
 * Execute a DAL operation and throw normalized BaseError on failure.
 * Note: Does not log errors; caller is responsible for logging if needed.
 */
export async function executeDalOrThrow<T>(
  thunk: () => Promise<T>,
  logCtx: LogCtx,
): Promise<T> {
  try {
    return await thunk();
  } catch (err) {
    throw normalizeDalError(err, logCtx);
  }
}
