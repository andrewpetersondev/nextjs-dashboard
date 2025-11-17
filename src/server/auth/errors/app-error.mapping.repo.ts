import "server-only";
import { PG_ERROR_MAP } from "@/server/auth/errors/pg-error.mapper";
import {
  type AppError,
  appErrorFromCode,
} from "@/shared/errors/app-error/app-error";
import { isBaseError } from "@/shared/errors/base-error";
import { ValidationError } from "@/shared/errors/base-error.subclasses";
import { ERROR_CODES } from "@/shared/errors/error-codes";
import { logger } from "@/shared/logging/logger.shared";

// Mapping table for domain errors
const DOMAIN_ERROR_MAP = new Map<
  new (
    ...args: never[]
  ) => Error,
  { code: Parameters<typeof appErrorFromCode>[0]; useMessage: boolean }
>([[ValidationError, { code: ERROR_CODES.validation.name, useMessage: true }]]);

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

  const context = err.getContext();

  return {
    code: err.code,
    diagnosticId: safeString(context?.diagnosticId),
    extra: {
      ...(context?.constraint ? { constraint: context.constraint } : {}),
      ...(context?.pgErrorCode ? { pgErrorCode: context.pgErrorCode } : {}),
      ...(context?.pgErrorName ? { pgErrorName: context.pgErrorName } : {}),
    },
    operation: safeString(context?.operation),
    table: safeString(context?.table),
    timestamp: safeString(context?.timestamp),
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

  // 2) Infrastructure/BaseError
  const baseErrorDetails = extractBaseErrorDetails(err);

  if (baseErrorDetails && isBaseError(err)) {
    logger.withContext(context).errorWithDetails("Database error", err);

    // Map unique constraint violations to conflict error
    const isUniqueViolation =
      baseErrorDetails.extra.pgErrorCode ===
        PG_ERROR_MAP.uniqueViolation.code || baseErrorDetails.extra.constraint;

    if (isUniqueViolation) {
      return appErrorFromCode(
        ERROR_CODES.conflict.name,
        "A record with this value already exists",
        {
          diagnosticId: baseErrorDetails.diagnosticId,
          extra: baseErrorDetails.extra,
        },
      );
    }

    // Other database errors
    return appErrorFromCode(
      ERROR_CODES.database.name,
      ERROR_CODES.database.description,
      {
        diagnosticId: baseErrorDetails.diagnosticId,
        extra: baseErrorDetails.extra,
      },
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
