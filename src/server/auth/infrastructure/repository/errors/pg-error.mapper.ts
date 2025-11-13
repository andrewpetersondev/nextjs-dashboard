// src/server/auth/infrastructure/repository/errors/pg-error.mapper.ts
import "server-only";
import { randomUUID } from "node:crypto";
import type { DatabaseError as PgDatabaseError } from "pg";
import { BaseError } from "@/shared/core/errors/base/base-error";
import type { DalContext, DalErrorContext } from "../types/dal-context";

const PG_ERROR_CODES = {
  checkViolation: "23514",
  deadlockDetected: "40P01",
  foreignKeyViolation: "23503",
  notNullViolation: "23502",
  serializationFailure: "40001",
  uniqueViolation: "23505",
} as const;

type PgCode = (typeof PG_ERROR_CODES)[keyof typeof PG_ERROR_CODES];

const TRANSIENT_CODES = new Set<PgCode>([
  PG_ERROR_CODES.serializationFailure,
  PG_ERROR_CODES.deadlockDetected,
]);

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
 * Build error context with diagnostic information.
 */
function buildErrorContext(
  dalContext: DalContext,
  pg: Partial<PgDatabaseError> | null,
  code: PgCode | undefined,
): DalErrorContext {
  const diagnosticId = randomUUID();
  const timestamp = new Date().toISOString();

  const metadata: Record<string, unknown> = {
    errorSource: "postgres",
  };

  if (code) {
    metadata.pgCode = code;
    metadata.retryable = TRANSIENT_CODES.has(code);
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

  return {
    ...dalContext,
    diagnosticId,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    timestamp,
  };
}

/**
 * Map Postgres error to canonical BaseError code.
 */
function mapPgCodeToErrorCode(
  code: PgCode | undefined,
): "conflict" | "database" {
  return code === PG_ERROR_CODES.uniqueViolation ? "conflict" : "database";
}

/**
 * Build user-friendly error message.
 */
function buildErrorMessage(
  code: PgCode | undefined,
  pg: Partial<PgDatabaseError> | null,
): string {
  if (code === PG_ERROR_CODES.uniqueViolation) {
    const constraint = pg?.constraint;
    if (constraint?.includes("email")) {
      return "Email already in use";
    }
    if (constraint?.includes("username")) {
      return "Username already taken";
    }
    return "A record with these values already exists";
  }

  if (code === PG_ERROR_CODES.foreignKeyViolation) {
    return "Referenced record does not exist";
  }

  if (code === PG_ERROR_CODES.notNullViolation) {
    return "Required field is missing";
  }

  return "Database operation failed";
}

/**
 * Convert Postgres error to normalized BaseError.
 * Single responsibility: error transformation only.
 */
export function toBaseErrorFromPg(
  err: unknown,
  dalContext: DalContext,
): BaseError {
  const pg = extractPgError(err);
  const code = pg?.code as PgCode | undefined;

  const errorContext = buildErrorContext(dalContext, pg, code);
  const errorCode = mapPgCodeToErrorCode(code);
  const message = buildErrorMessage(code, pg);

  // Flatten context for BaseError (no nested objects)
  const flatContext = {
    context: errorContext.context,
    diagnosticId: errorContext.diagnosticId,
    operation: errorContext.operation,
    timestamp: errorContext.timestamp,
    ...errorContext.identifiers,
    ...(errorContext.metadata ?? {}),
  };

  return BaseError.wrap(errorCode, err, flatContext, message);
}
