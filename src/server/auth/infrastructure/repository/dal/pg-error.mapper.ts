import "server-only";
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
  eIsObjectWithCause,
  eIsObjectWithCode,
  generateDiagnosticId,
  getPgCode,
  readStr,
} from "@/server/auth/infrastructure/repository/dal/pg-error-utils";
import { BaseError } from "@/shared/core/errors/base/base-error";
import { ERROR_CODES } from "@/shared/core/errors/base/error-codes";

function _buildErrorDetails(
  ctx: Record<string, unknown>,
  pg: Partial<PgDatabaseError> | undefined,
  code: string | undefined,
  diagnosticId: string,
) {
  const operation = readStr(ctx.operation);
  return {
    ...ctx,
    ...(code ? { code } : {}),
    ...(pg?.message ? { pgMessage: readStr(pg.message) } : {}),
    ...(pg?.constraint ? { constraint: readStr(pg.constraint) } : {}),
    ...(pg?.detail ? { pgDetail: readStr(pg.detail) } : {}),
    ...(pg?.schema ? { schema: readStr(pg.schema) } : {}),
    ...(pg?.table ? { table: readStr(pg.table) } : {}),
    ...(operation ? { operation } : {}),
    ...(code && isTransientPgCode(code) ? { retryable: true as const } : {}),
    diagnosticId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Convert unknown Postgres or wrapped errors into BaseError variants with normalized context.
 *
 * Behavior:
 * - 23505 → ConflictError (mapped via `conflictFromUniqueViolation`)
 * - Transient codes → adds `retryable: true`
 * - Enriches error context with constraint, schema, table, detail, and pg message
 * - Always assigns a `diagnosticId` and ISO timestamp for traceability
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: <explanation>
export function toBaseErrorFromPgUnknown(
  err: unknown,
  ctx: Readonly<Record<string, unknown>> = {},
  constraintHints: ConstraintFieldHints = SIGNUP_CONSTRAINT_HINTS,
): BaseError {
  const code = getPgCode(err);

  // ---- Handle UNIQUE constraint violations specially ----
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
  // ---- Build normalized diagnostic context ----
  let pg: Partial<PgDatabaseError> | undefined;
  if (eIsObjectWithCause(err)) {
    pg = err.cause as Partial<PgDatabaseError>;
  } else if (eIsObjectWithCode(err)) {
    pg = err as Partial<PgDatabaseError>;
  } else {
    pg = undefined;
  }
  const diagnosticId = generateDiagnosticId();

  const baseMessage = code
    ? buildDatabaseMessageFromCode(code)
    : ERROR_CODES.database.description;

  // Extract useful fields safely
  const constraint = readStr(pg?.constraint);
  const operation = readStr(ctx.operation);
  const table = readStr(pg?.table);
  const pgMessage = readStr(pg?.message);
  const pgDetail = readStr(pg?.detail);
  const schema = readStr(pg?.schema);

  // ---- Build structured error details ----
  const details = {
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
  // ---- Wrap everything into a normalized BaseError ----
  return BaseError.wrap("database", err, details, baseMessage);
}
