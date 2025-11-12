/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
/** biome-ignore-all lint/complexity/noExcessiveLinesPerFunction: <explanation> */
import "server-only";
import { randomUUID } from "node:crypto";
import type { DatabaseError as PgDatabaseError } from "pg";
import {
  buildDatabaseMessageFromCode,
  type ConstraintFieldHints,
  isTransientPgCode,
  PG_ERROR_CODES,
  SIGNUP_CONSTRAINT_HINTS,
} from "@/server/auth/infrastructure/repository/dal/pg-error-codes";
import {
  conflictFromUniqueViolation,
  getPgCode,
  readStr,
} from "@/server/auth/infrastructure/repository/dal/pg-error-utils";
import { BaseError } from "@/shared/core/errors/base/base-error";
import { ERROR_CODES } from "@/shared/core/errors/base/error-codes";

/**
 * Convert unknown/PG errors into BaseError variants with normalized context.
 * - 23505 → ConflictError (with constraint/field hint when available)
 * - transient codes → details.retryable = true
 * - enrich context with pg detail/schema/table/constraint when present
 *
 * Adds `diagnosticId` and richer context for logging and error messages.
 */
export function toBaseErrorFromPgUnknown(
  err: unknown,
  ctx: Readonly<Record<string, unknown>> = {},
  constraintHints: ConstraintFieldHints = SIGNUP_CONSTRAINT_HINTS,
): BaseError {
  const code = getPgCode(err);

  if (code === PG_ERROR_CODES.uniqueViolation) {
    return conflictFromUniqueViolation(
      err,
      {
        context: readStr(ctx.context) ?? "database",
        identifiers: Object.fromEntries(
          Object.entries(ctx).filter(
            ([k]) => k !== "context" && k !== "operation",
          ),
        ),
        operation: readStr(ctx.operation) ?? "toBaseErrorFromPgUnknown",
      },
      constraintHints,
    );
  }

  const pg = err as Partial<PgDatabaseError> | null;
  const diagnosticId =
    typeof randomUUID === "function"
      ? randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const baseMessage = code
    ? buildDatabaseMessageFromCode(code)
    : ERROR_CODES.database.description;

  const constraint = readStr(pg?.constraint);
  const operation = readStr(ctx.operation);
  const table = readStr(pg?.table);

  const details = {
    ...ctx,
    ...(code ? { code } : {}),
    ...(readStr(pg?.message) ? { pgMessage: readStr(pg?.message) } : {}),
    ...(constraint ? { constraint } : {}),
    ...(readStr(pg?.detail) ? { pgDetail: readStr(pg?.detail) } : {}),
    ...(readStr(pg?.schema) ? { schema: readStr(pg?.schema) } : {}),
    ...(table ? { table } : {}),
    ...(operation ? { operation } : {}),
    ...(code && isTransientPgCode(code) ? { retryable: true as const } : {}),
    diagnosticId,
    timestamp: new Date().toISOString(),
  };
  return BaseError.wrap("database", err, details, baseMessage);
}
