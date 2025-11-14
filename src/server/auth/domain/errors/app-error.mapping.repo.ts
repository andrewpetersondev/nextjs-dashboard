import "server-only";
import { isBaseError } from "@/shared/core/errors/base/base-error";
import {
  ERROR_CODES,
  type ErrorCode,
} from "@/shared/core/errors/base/error-codes";
import {
  ConflictError,
  ValidationError,
} from "@/shared/core/errors/domain/base-error.subclasses";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { appErrorFromCode } from "@/shared/core/result/app-error/app-error-builders";
import { logger } from "@/shared/logging/logger.shared";

// Mapping table for domain errors
const DOMAIN_ERROR_MAP = new Map<
  new (
    ...args: never[]
  ) => Error,
  { code: Parameters<typeof appErrorFromCode>[0]; useMessage: boolean }
>([
  [ValidationError, { code: ERROR_CODES.validation.name, useMessage: true }],
  [ConflictError, { code: ERROR_CODES.conflict.name, useMessage: true }],
]);

function mapDomainError(err: Error): AppError | null {
  for (const [ErrorClass, config] of DOMAIN_ERROR_MAP) {
    if (err instanceof ErrorClass) {
      const message = config.useMessage ? err.message : "Invalid credentials";
      return appErrorFromCode(config.code, message);
    }
  }
  return null;
}

function safeString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function extractBaseErrorDetails(
  err: ReturnType<typeof isBaseError> extends true ? never : unknown,
) {
  if (!isBaseError(err)) {
    return null;
  }

  if (err.code !== ERROR_CODES.database.name) {
    return null;
  }

  const details = err.getDetails();
  return {
    diagnosticId: safeString(details?.diagnosticId),
    operation: safeString(details?.operation),
    table: safeString(details?.table),
    timestamp: safeString(details?.timestamp),
  };
}

/**
 * Primary mapping function:
 * Maps repository/infrastructure errors to a standardized AppError.
 *
 * Policy:
 * - Domain errors (Unauthorized, Validation, Conflict, etc.) → corresponding AppError codes
 * - Infrastructure errors (DatabaseError/BaseError with code "database") → generic DATABASE AppError
 * - Unknown errors → UNKNOWN AppError
 */
export function mapRepoError(err: unknown, context: string): AppError {
  // 1) Domain errors first
  if (err instanceof Error) {
    const domainError = mapDomainError(err);
    if (domainError) {
      return domainError;
    }
  }

  // 2) Infrastructure/BaseError (e.g., DatabaseError)
  const baseErrorDetails = extractBaseErrorDetails(err);
  if (baseErrorDetails) {
    if (isBaseError(err)) {
      logger.withContext(context).errorWithDetails("Database error", err);
    } else {
      logger.error("Database error", {
        code: ERROR_CODES.database.name satisfies ErrorCode,
        context,
        ...baseErrorDetails,
      });
    }

    return appErrorFromCode(
      ERROR_CODES.database.name satisfies ErrorCode,
      ERROR_CODES.database.description,
      baseErrorDetails.diagnosticId
        ? { diagnosticId: baseErrorDetails.diagnosticId }
        : undefined,
    );
  }

  // 3) Unknown error fallback
  logger.error("Unexpected repository error", {
    context,
    error: err instanceof Error ? err.message : String(err),
  });

  return appErrorFromCode(
    ERROR_CODES.unknown.name,
    ERROR_CODES.unknown.description,
  );
}
