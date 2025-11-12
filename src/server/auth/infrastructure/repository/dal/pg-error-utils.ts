import "server-only";
import { randomUUID } from "node:crypto";
import type { DatabaseError as PgDatabaseError } from "pg";
import {
  type ConstraintFieldHints,
  PG_CODE_SET,
  PG_ERROR_CODES,
  type PgCode,
  SIGNUP_CONSTRAINT_HINTS,
} from "@/server/auth/infrastructure/repository/dal/pg-error-codes";
import { ConflictError } from "@/shared/core/errors/domain/domain-errors";
import type { OperationMetadata } from "@/shared/logging/logger.shared";

/**
 * Read a string property, ensuring it's a non-empty string, or undefined.
 */
export function readStr(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

/**
 * Return code property from a pg error. Accepts both native instance and error-wrapped objects.
 */
export function getPgCode(e: unknown): PgCode | undefined {
  // Prefer pg-native error typing for full property access
  if (
    e &&
    typeof e === "object" &&
    "code" in e &&
    typeof (e as any).code === "string"
  ) {
    const code = (e as PgDatabaseError).code;
    return code && PG_CODE_SET.has(code) ? (code as PgCode) : undefined;
  }
  // Fallback: try cause
  if (
    e &&
    typeof e === "object" &&
    "cause" in e &&
    e.cause &&
    typeof e.cause === "object"
  ) {
    const code = (e.cause as PgDatabaseError).code;
    return code && PG_CODE_SET.has(code) ? (code as PgCode) : undefined;
  }
  return;
}

/**
 * Map a PG unique violation to a ConflictError with optional field hint from constraint name.
 *
 * The logging context passed here is aligned to logger.operation of logger.shared.ts:
 *   - `operation` (operation name, e.g. "insertUser")
 *   - `context` (logger context string, e.g. "dal.users")
 *   - `identifiers` (object with business keys, e.g. { email: "foo@bar" })
 *
 * All `identifiers` fields are merged into the log object as top-level keys.
 */
export function conflictFromUniqueViolation(
  err: unknown,
  logCtx: OperationMetadata,
  constraintHints?: ConstraintFieldHints,
): ConflictError {
  const pg: Partial<PgDatabaseError> | undefined =
    err as Partial<PgDatabaseError>;

  // Try to get constraint from error or nested cause
  let constraint = readStr(pg?.constraint);
  if (!constraint && err && typeof err === "object" && "cause" in err) {
    constraint = readStr(
      (err.cause as Partial<PgDatabaseError> | null)?.constraint,
    );
  }

  const hints = constraintHints ?? SIGNUP_CONSTRAINT_HINTS;
  const field = constraint ? hints[constraint] : undefined;

  const diagnosticId =
    typeof randomUUID === "function"
      ? randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  // Try to get message from error or nested cause
  let pgMessage = readStr(pg?.message);
  if (!pgMessage && err && typeof err === "object" && "cause" in err) {
    pgMessage = readStr(
      (err.cause as Partial<PgDatabaseError> | null)?.message,
    );
  }

  // ---- LOGGING CONTEXT: OperationData aligned ----
  //   - context: string (e.g. "dal.users") if given
  //   - operation: string (e.g. "insertUser") if given
  //   - all identifiers as top level fields
  //   - diagnosticId always
  //   - constraint/field/pgMessage present if available
  //   - code always set (PG unique violation)
  const details = {
    operation: logCtx.operation,
    ...(logCtx.identifiers ?? {}),
    ...(constraint ? { constraint } : {}),
    ...(field ? { field } : {}),
    ...(pgMessage ? { pgMessage } : {}),
    code: PG_ERROR_CODES.uniqueViolation,
    diagnosticId,
    // Keep the original context for logger.withContext if present (do NOT duplicate as data/context)
    // context is not included in data (it is passed to logger.withContext(<context>) at call time)
  };

  const message = field
    ? `A ${field} with this value already exists.`
    : "A record with these values already exists.";

  return new ConflictError(message, details, err);
}
