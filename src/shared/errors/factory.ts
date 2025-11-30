// src/shared/errors/core/factory.ts
import { AppError } from "@/shared/errors/app-error";
import type { AppErrorKey } from "@/shared/errors/registry";
import type { AppErrorOptions, FormErrorMetadata } from "@/shared/errors/types";

/**
 * Canonical factory for creating `AppError` instances.
 */
export function makeAppError(
  code: AppErrorKey,
  options: AppErrorOptions = {},
): AppError {
  return new AppError(code, options);
}

/**
 * Convenience helpers for common patterns.
 */
export function makeValidationError(
  options: AppErrorOptions & { metadata: FormErrorMetadata },
): AppError {
  return makeAppError("validation", options);
}

export function makeUnexpectedError(options: AppErrorOptions = {}): AppError {
  return makeAppError("unexpected", options);
}

export function makeInvariantError(
  message: string,
  metadata?: Record<string, unknown>,
): AppError {
  return makeAppError("unexpected", {
    message: `Invariant failed: ${message}`,
    metadata: { ...metadata, kind: "invariant" },
  });
}

export function makeIntegrityError(options: AppErrorOptions = {}): AppError {
  return makeAppError("integrity", options);
}

/**
 * Type guard for narrowing to `AppError`.
 */
export function isBaseError(error: unknown): error is AppError {
  return AppError.isAppError(error);
}
