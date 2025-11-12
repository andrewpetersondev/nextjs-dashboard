import "server-only";
import type { DatabaseError as PgDatabaseError } from "pg";
import {
  buildDatabaseMessageFromCode,
  isTransientPgCode,
  PG_ERROR_CODES,
  type PgCode,
} from "@/server/auth/infrastructure/repository/dal/pg-error-codes";
import {
  eIsObjectWithCause,
  eIsObjectWithCode,
  generateDiagnosticId,
  getPgCode,
  readStr,
} from "@/server/auth/infrastructure/repository/dal/pg-error-utils";
import { BaseError } from "@/shared/core/errors/base/base-error";
import { ERROR_CODES } from "@/shared/core/errors/base/error-codes";

/**
 * Helper to construct detailed error context for DAL/PG errors.
 * - Merges caller context
 * - Extracts relevant fields from the Postgres error (constraint, table, detail, schema, message)
 * - Marks retryable for transient errors
 * - Always attaches diagnostic ID & timestamp (ISO string)
 */
export function buildErrorDetails(
  ctx: Record<string, unknown>,
  pg: Partial<PgDatabaseError> | undefined,
  code: PgCode | undefined,
  diagnosticId: string,
) {
  const operation = readStr(ctx.operation);
  const constraint = readStr(pg?.constraint);
  const table = readStr(pg?.table);
  const pgMessage = readStr(pg?.message);
  const pgDetail = readStr(pg?.detail);
  const schema = readStr(pg?.schema);

  return {
    ...ctx,
    ...(code ? { code } : {}),
    ...(pgMessage ? { pgMessage } : {}),
    ...(constraint ? { constraint } : {}),
    ...(pgDetail ? { pgDetail } : {}),
    ...(schema ? { schema } : {}),
    ...(table ? { table } : {}),
    ...(operation ? { operation } : {}),
    ...(code && isTransientPgCode(code) ? { retryable: true as const } : {}),
    diagnosticId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Converts errors from Postgres (native or cause-wrapped) to a normalized BaseError.
 * - Handles unique violation with "conflict" code.
 * - Attaches constraint/field/meta context.
 * - Assigns stable diagnosticId and timestamp to all conversions.
 */
export function toBaseErrorFromPgUnknown(
  err: unknown,
  ctx: Readonly<Record<string, unknown>> = {},
): BaseError {
  const code = getPgCode(err);
  let pg: Partial<PgDatabaseError> | undefined;

  if (eIsObjectWithCause(err)) {
    pg = err.cause as Partial<PgDatabaseError>;
  } else if (eIsObjectWithCode(err)) {
    pg = err as Partial<PgDatabaseError>;
  }

  const diagnosticId = generateDiagnosticId();
  const normalizedCode =
    code === PG_ERROR_CODES.uniqueViolation ? "conflict" : "database";

  const baseMessage = code
    ? buildDatabaseMessageFromCode(code)
    : ERROR_CODES.database.description;

  const details = buildErrorDetails(ctx, pg, code, diagnosticId);

  return BaseError.wrap(normalizedCode, err, details, baseMessage);
}
