import "server-only";
import {
  isPgUniqueViolation,
  toBaseErrorFromPgUnknown,
} from "@/server/auth/infrastructure/repository/dal/pg-error.mapper";
import { serverLogger } from "@/server/logging/serverLogger";
import type { BaseError } from "@/shared/core/errors/base/base-error";
import { logUnknownAsBaseError } from "@/shared/core/errors/logging/error-logger";

type LogCtx = Readonly<{
  operation: string;
  context?: string;
  identifiers?: Readonly<Record<string, unknown>>;
}>;

function buildLogExtra(ctx?: LogCtx): Readonly<Record<string, unknown>> {
  return {
    ...(ctx?.identifiers ?? {}),
    ...(ctx?.context ? { context: ctx.context } : {}),
    operation: ctx?.operation,
  };
}

function normalizeDalError(err: unknown, ctx: LogCtx | undefined): BaseError {
  const baseCtx = {
    operation: ctx?.operation,
    ...(ctx?.context ? { context: ctx.context } : {}),
    ...(ctx?.identifiers ?? {}),
  };
  return isPgUniqueViolation(err)
    ? toBaseErrorFromPgUnknown(err, baseCtx)
    : toBaseErrorFromPgUnknown(err, baseCtx);
}

/**
 * Execute a DAL operation and throw normalized BaseError on failure.
 */
export async function executeDalOrThrow<T>(
  op: () => Promise<T>,
  logCtx?: LogCtx,
): Promise<T> {
  try {
    return await op();
  } catch (err) {
    const be = normalizeDalError(err, logCtx);
    logUnknownAsBaseError(serverLogger, be, buildLogExtra(logCtx));
    throw be;
  }
}
