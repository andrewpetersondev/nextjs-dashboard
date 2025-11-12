import "server-only";
import { randomUUID } from "node:crypto";
import type { DatabaseError as PgDatabaseError } from "pg";
import {
  type ConstraintFieldHints,
  isPgCode,
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
  if (eIsObjectWithCode(e) && isPgCode(e.code)) {
    return e.code;
  }
  // Fallback: try cause
  if (
    eIsObjectWithCause(e) &&
    eIsObjectWithCode(e.cause) &&
    isPgCode(e.cause.code)
  ) {
    return e.cause.code;
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
  if (!constraint && eIsObjectWithCause(err)) {
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
  if (!pgMessage && eIsObjectWithCause(err)) {
    pgMessage = readStr(
      (err.cause as Partial<PgDatabaseError> | null)?.message,
    );
  }

  // ---- LOGGING CONTEXT: OperationData aligned ----
  const details = {
    operation: logCtx.operation,
    ...(logCtx.identifiers ?? {}),
    ...(constraint ? { constraint } : {}),
    ...(field ? { field } : {}),
    ...(pgMessage ? { pgMessage } : {}),
    code: PG_ERROR_CODES.uniqueViolation,
    diagnosticId,
    // context is handled externally by logger.withContext()
  };

  const message = field
    ? `A ${field} with this value already exists.`
    : "A record with these values already exists.";

  return new ConflictError(message, details, err);
}

/**
 * Type guard: true if e is an object with a non-null cause object.
 */
export function eIsObjectWithCause(
  e: unknown,
): e is { cause: Record<string, unknown> } {
  return (
    e !== null &&
    typeof e === "object" &&
    "cause" in e &&
    Boolean((e as any).cause) &&
    typeof (e as any).cause === "object"
  );
}

/**
 * Type guard: true if e is an object with a non-empty string `code` property.
 */
export function eIsObjectWithCode(e: unknown): e is { code: string } {
  return (
    e !== null &&
    typeof e === "object" &&
    "code" in e &&
    typeof (e as any).code === "string" &&
    (e as any).code.length > 0
  );
}

/**
 * Generate a unique diagnostic ID for errors.
 */
export function generateDiagnosticId(): string {
  return typeof randomUUID === "function"
    ? randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function extractPgField(
  pg: Partial<PgDatabaseError> | undefined,
  field: keyof PgDatabaseError,
) {
  return readStr(pg?.[field]);
}
