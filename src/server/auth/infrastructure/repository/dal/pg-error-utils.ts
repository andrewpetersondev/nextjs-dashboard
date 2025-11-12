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
 * Includes signup-focused constraint → field hints.
 */
export function conflictFromUniqueViolation(
  err: unknown,
  logCtx: {
    readonly context?: string;
    readonly operation?: string;
    readonly identifiers?: Readonly<Record<string, unknown>>;
  },
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

  const details = {
    code: PG_ERROR_CODES.uniqueViolation,
    ...(logCtx.context ? { context: logCtx.context } : {}),
    ...(logCtx.operation ? { operation: logCtx.operation } : {}),
    ...(logCtx.identifiers ?? {}),
    ...(constraint ? { constraint } : {}),
    ...(field ? { field } : {}),
    ...(pgMessage ? { pgMessage } : {}),
    diagnosticId,
  };

  const message = field
    ? `A ${field} with this value already exists.`
    : "A record with these values already exists.";

  return new ConflictError(message, details, err);
}
