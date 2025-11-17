// src/server/auth/infrastructure/repository/errors/pg-error.mapper.ts
import "server-only";
import { randomUUID } from "node:crypto";
import type { DatabaseError as PgDatabaseError } from "pg";
import type { AuthLayerContext } from "@/server/auth/logging/auth-layer-context";
import { toErrorContext } from "@/server/auth/logging/auth-layer-context";
import { ErrorMappingFactory } from "@/server/auth/logging/auth-logging.contexts";
import { BaseError } from "@/shared/errors/base-error";
import { ERROR_CODES, type ErrorCode } from "@/shared/errors/error-codes";

const PG_ERROR_SOURCE = "postgres" as const;
const PG_DEFAULT_APP_CODE = ERROR_CODES.database.name satisfies ErrorCode;
const PG_DEFAULT_MESSAGE = ERROR_CODES.database.description;

const PG_ERROR_MAP = {
  checkViolation: {
    appCode: ERROR_CODES.database.name satisfies ErrorCode,
    code: "23514",
    message: "db.check.violation",
    name: "checkViolation",
    retryable: false as const,
  },
  deadlockDetected: {
    appCode: ERROR_CODES.database.name satisfies ErrorCode,
    code: "40P01",
    message: "db.deadlock.detected",
    name: "deadlockDetected",
    retryable: true as const,
  },
  foreignKeyViolation: {
    appCode: ERROR_CODES.database.name satisfies ErrorCode,
    code: "23503",
    message: "db.foreign_key.violation",
    name: "foreignKeyViolation",
    retryable: false as const,
  },
  notNullViolation: {
    appCode: ERROR_CODES.database.name satisfies ErrorCode,
    code: "23502",
    message: "db.not_null.violation",
    name: "notNullViolation",
    retryable: false as const,
  },
  serializationFailure: {
    appCode: ERROR_CODES.database.name satisfies ErrorCode,
    code: "40001",
    message: "db.serialization.failure",
    name: "serializationFailure",
    retryable: true as const,
  },
  uniqueViolation: {
    appCode: ERROR_CODES.database.name satisfies ErrorCode,
    code: "23505",
    message: "db.unique.violation",
    name: "uniqueViolation",
    retryable: false as const,
  },
} as const;

type PgErrorMeta = (typeof PG_ERROR_MAP)[keyof typeof PG_ERROR_MAP];
type PgCode = PgErrorMeta["code"];

function getPgErrorMetaByCode(
  code: PgCode | undefined,
): PgErrorMeta | undefined {
  if (!code) {
    return;
  }
  return Object.values(PG_ERROR_MAP).find((entry) => entry.code === code);
}

/**
 * Extract Postgres error information from unknown error.
 */
function extractPgError(err: unknown): Partial<PgDatabaseError> | null {
  if (!err || typeof err !== "object") {
    return null;
  }
  // Check if error itself is PgDatabaseError
  if ("code" in err && typeof err.code === "string") {
    return err as Partial<PgDatabaseError>;
  }
  // Check nested cause
  if ("cause" in err && err.cause && typeof err.cause === "object") {
    return err.cause as Partial<PgDatabaseError>;
  }
  return null;
}

/**
 * Build additional metadata for Postgres errors, to be merged into ErrorContext.
 *
 * This function is layer-agnostic and only knows about PG details.
 */
function buildPgErrorMetadata(
  pg: Partial<PgDatabaseError> | null,
  code: PgCode | undefined,
): Readonly<Record<string, unknown>> {
  const metadata: Record<string, unknown> = {
    errorSource: PG_ERROR_SOURCE,
  };

  const meta = getPgErrorMetaByCode(code);

  if (code) {
    metadata.pgCode = code;
    metadata.errorMapping = ErrorMappingFactory.pgError(code, pg?.detail);
    if (meta) {
      metadata.retryable = meta.retryable;
      metadata.pgErrorName = meta.name;
    }
  }
  if (pg) {
    if (pg.constraint) {
      metadata.constraint = pg.constraint;
    }
    if (pg.table) {
      metadata.table = pg.table;
    }
    if (pg.schema) {
      metadata.schema = pg.schema;
    }
    if (pg.detail) {
      metadata.pgDetail = pg.detail;
    }
    if (pg.hint) {
      metadata.pgHint = pg.hint;
    }
  }

  return metadata;
}

/**
 * Map Postgres error to canonical BaseError code.
 */
function mapPgCodeToErrorCode(code: PgCode | undefined): ErrorCode {
  const meta = getPgErrorMetaByCode(code);
  return meta?.appCode ?? PG_DEFAULT_APP_CODE;
}

/**
 * Build an infrastructure-level error message.
 *
 * NOTE:
 *  - This intentionally does NOT inspect constraint/table names to derive
 *    domain/user-facing messages (e.g. "Email already in use").
 *  - Domain/application layers should look at `error.code` and context
 *    metadata (constraint, table, etc.) to decide final messages.
 */
function buildErrorMessage(code: PgCode | undefined): string {
  const meta = getPgErrorMetaByCode(code);
  if (meta) {
    return meta.message;
  }
  return PG_DEFAULT_MESSAGE;
}

/**
 * Convert Postgres error to normalized BaseError.
 * Single responsibility: error transformation only.
 */
export function mapPgErrorToBase(
  err: unknown,
  dalContext: AuthLayerContext<"infrastructure.dal">,
): BaseError {
  const pg = extractPgError(err);
  const code = pg?.code as PgCode | undefined;

  const diagnosticId = randomUUID();
  const timestamp = new Date().toISOString();

  const metadata = buildPgErrorMetadata(pg, code);

  /**
   * Unified ErrorContext shape across all auth layers.
   * Extras (diagnosticId, timestamp, pgCode, constraint, etc.) are merged in.
   */
  const errorContext = toErrorContext(dalContext, {
    diagnosticId,
    timestamp,
    ...metadata,
  });

  const errorCode = mapPgCodeToErrorCode(code);
  const message = buildErrorMessage(code);

  return BaseError.wrap(errorCode, err, errorContext, message);
}
