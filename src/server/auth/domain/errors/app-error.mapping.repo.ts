import "server-only";
import { DatabaseError } from "@/server/errors/infrastructure-errors";
import { isBaseError } from "@/shared/core/errors/base/base-error";
import { ERROR_CODES } from "@/shared/core/errors/base/error-codes";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/shared/core/errors/domain/domain-errors";
import type { AppError } from "@/shared/core/result/app-error/app-error";
import { appErrorFromCode } from "@/shared/core/result/app-error/app-error-builders";
import { Err, type Result } from "@/shared/core/result/result";
import { logger } from "@/shared/logging/logger.shared";

// Mapping table for domain errors
const DOMAIN_ERROR_MAP = new Map<
  new (
    ...args: never[]
  ) => Error,
  { code: Parameters<typeof appErrorFromCode>[0]; useMessage: boolean }
>([
  [UnauthorizedError, { code: "unauthorized", useMessage: false }],
  [ValidationError, { code: "validation", useMessage: true }],
  [ConflictError, { code: "conflict", useMessage: true }],
  [ForbiddenError, { code: "forbidden", useMessage: true }],
  [NotFoundError, { code: "notFound", useMessage: true }],
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

  // Only handle infrastructure errors here, not domain errors
  if (err.code !== "database") {
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
 * Maps repository errors to standardized AppError Results.
 *
 * This is the single source of truth for error translation from the repository
 * layer to the application layer. All service methods should route caught errors
 * through this function to ensure consistent error handling.
 *
 * @typeParam T - The expected success type (for Result type compatibility)
 * @param err - The caught error from repository layer
 * @param context - Logging context identifier (e.g., "auth-user.service.login")
 * @returns Result.Err containing standardized AppError
 *
 * @remarks
 * Error mapping policy:
 * - Domain errors (Unauthorized, Validation, etc.) → Corresponding AppError codes
 * - Infrastructure errors (Database) → Generic messages (hide internals)
 * - Unknown errors → Logged and wrapped as UNKNOWN
 */
export function mapRepoErrorToAppResult<T>(
  err: unknown,
  context: string,
): Result<T, AppError> {
  // DEBUG: Log the error type
  console.log("[mapRepoErrorToAppResult] Error type:", {
    code: isBaseError(err) ? err.code : "N/A",
    isBaseError: isBaseError(err),
    isConflictError: err instanceof ConflictError,
    name: err instanceof Error ? err.constructor.name : typeof err,
  });

  // Handle domain errors FIRST (including ConflictError)
  if (err instanceof Error) {
    const domainError = mapDomainError(err);
    console.log("[mapRepoErrorToAppResult] Domain error result:", domainError);
    if (domainError) {
      return Err(domainError);
    }
  }

  // Handle infrastructure BaseErrors (database code only)
  const baseErrorDetails = extractBaseErrorDetails(err);
  console.log(
    "[mapRepoErrorToAppResult] Base error details:",
    baseErrorDetails,
  );
  if (baseErrorDetails) {
    if (isBaseError(err)) {
      logger.withContext(context).errorWithDetails("Database error", err);
    } else {
      logger.error("Database error", {
        code: "database",
        context,
        ...baseErrorDetails,
      });
    }

    return Err(
      appErrorFromCode(
        "database",
        ERROR_CODES.database.description,
        baseErrorDetails.diagnosticId
          ? { diagnosticId: baseErrorDetails.diagnosticId }
          : undefined,
      ),
    );
  }

  // Legacy DatabaseError
  if (err instanceof DatabaseError) {
    logger.error("Database error", { context, error: err.message });
    return Err(appErrorFromCode("database", ERROR_CODES.database.description));
  }

  // Unknown error fallback
  logger.error("Unexpected repository error", {
    context,
    error: err instanceof Error ? err.message : String(err),
  });
  return Err(appErrorFromCode("unknown", ERROR_CODES.unknown.description));
}
