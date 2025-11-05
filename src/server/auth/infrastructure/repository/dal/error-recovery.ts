import "server-only";
import { isBaseError } from "@/shared/core/errors/base/base-error";
import { getPgCode, isTransientPgCode } from "./pg-error.mapper";

/**
 * Determines if an error is retryable based on its characteristics.
 * Uses both BaseError metadata and PG error code analysis.
 */
export function isRetryableError(err: unknown): boolean {
  // Check BaseError retryable flag
  if (isBaseError(err)) {
    const details = err.getDetails();
    if (typeof details?.retryable === "boolean") {
      return details.retryable;
    }
  }

  // Check PG error code
  const pgCode = getPgCode(err);
  if (pgCode) {
    return isTransientPgCode(pgCode);
  }

  return false;
}

/**
 * Extract diagnostic ID from any error for correlation.
 */
export function getDiagnosticId(err: unknown): string | undefined {
  if (isBaseError(err)) {
    const details = err.getDetails();
    return typeof details?.diagnosticId === "string"
      ? details.diagnosticId
      : undefined;
  }
  return;
}
