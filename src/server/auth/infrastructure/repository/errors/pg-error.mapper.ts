// src/server/auth/infrastructure/repository/errors/pg-error.mapper.ts
import "server-only";
import type { DatabaseError as PgDatabaseError } from "pg";
import {
  buildDatabaseMessageFromCode,
  PG_ERROR_CODES,
} from "@/server/auth/infrastructure/repository/errors/pg-error-codes";
import {
  buildErrorDetails,
  eIsObjectWithCause,
  eIsObjectWithCode,
  generateDiagnosticId,
  getPgCode,
} from "@/server/auth/infrastructure/repository/errors/pg-error-utils";
import { BaseError } from "@/shared/core/errors/base/base-error";
import { ERROR_CODES } from "@/shared/core/errors/base/error-codes";

/**
 * Converts errors from Postgres (native or cause-wrapped) to a normalized BaseError.
 * - Handles unique violation with "conflict" code.
 * - Attaches constraint/field/meta context.
 * - Assigns stable diagnosticId and timestamp to all conversions.
 * - Includes enhanced diagnostic information for debugging.
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
