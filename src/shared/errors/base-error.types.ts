// src/shared/errors/base-error.types.ts
import type { AppErrorCode, Severity } from "@/shared/errors/error-codes";

export interface BaseErrorContext {
  readonly [key: string]: unknown;
}

export interface SerializedError {
  readonly code: AppErrorCode;
  readonly context?: BaseErrorContext;
  readonly message: string;
  readonly name: string;
  readonly statusCode: number;
  readonly timestamp: string;
}

export interface ErrorFactoryOptions {
  readonly cause?: Error;
  readonly context?: BaseErrorContext;
  readonly message?: string;
  readonly statusCode?: number;
}

/**
 * Immutable diagnostic context attached to an error at construction time.
 *
 * Contains error-specific metadata that helps understand what went wrong:
 * - Entity identifiers related to the failure (userId, orderId, productId)
 * - Operation parameters that triggered the error (email, role, action)
 * - Database constraint violations (constraintName, conflictingValue)
 * - Validation failures (invalidField, expectedFormat, receivedValue)
 * - Business rule violations (quotaLimit, currentUsage)
 * - Transaction/operation identifiers (transactionId, batchId)
 *
 * This context is frozen and preserved through error remapping/wrapping.
 * It travels with the error object itself and is part of error serialization.
 *
 * For ephemeral operational metadata about the logging event (requestId,
 * hostname, environment), use LoggingContext in LogBaseErrorOptions instead.
 *
 * @example
 * ```typescript
 * const errorContext: ErrorContext = {
 *   userId: '123',
 *   operation: 'updateProfile',
 *   attemptedEmail: 'user@example.com',
 *   constraintViolated: 'unique_email',
 * };
 *
 * throw new BaseError('USER_EMAIL_DUPLICATE', { context: errorContext });
 * // This context is part of the error and logged automatically
 */
export type ErrorContext = Readonly<Record<string, unknown>>;

/**
 * JSON-safe representation of a {@link BaseError}.
 *
 * - Intended for serialization across process or network boundaries
 *   (e.g. HTTP responses, logs, queues).
 * - Does **not** include stack traces or underlying `cause` to avoid
 *   leaking internal implementation details.
 * - `context` is only included if non-empty.
 */
export interface BaseErrorJson {
  readonly category: string;
  readonly code: AppErrorCode;
  readonly context?: ErrorContext;
  readonly description: string;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly formErrors?: readonly string[];
  readonly message: string;
  readonly retryable: boolean;
  readonly severity: Severity;
  readonly statusCode: number;
}

/**
 * Serialized representation of an Error cause.
 *
 * Provides a safe, JSON-compatible structure for error causes.
 */
export interface SerializedErrorCause {
  readonly code?: AppErrorCode;
  readonly message: string;
  readonly name: string;
  readonly severity?: Severity;
  readonly stack?: string;
}

/**
 * Shape of a {@link BaseError} when emitted via logging.
 *
 * - Extends {@link BaseErrorJson} with optional diagnostic and debugging fields.
 * - `diagnosticId` is extracted from `context.diagnosticId` when present.
 * - `stack` / `cause` are only included when detailed logging is enabled.
 *
 * Note: This payload contains only error-related data. Logging metadata
 * (requestId, hostname, etc.) is attached at the LogEntry level.
 */
export interface BaseErrorLogPayload extends BaseErrorJson {
  readonly cause?: SerializedErrorCause;
  readonly diagnosticId?: string;
  readonly originalCauseRedacted?: boolean;
  readonly originalCauseType?: string;
  readonly stack?: string;
  readonly validationErrorPresent?: boolean;
}

/**
 * Constructor options for {@link BaseError}.
 *
 * Keeps the constructor signature small and stable while allowing:
 * - message override (defaults to error code description)
 * - structured diagnostic context
 * - an underlying cause (any unknown value)
 */
export interface BaseErrorOptions {
  /**
   * The underlying cause of the error.
   * Can be another Error, a string, or any unknown value caught in a catch block.
   */
  readonly cause?: unknown;
  /**
   * Diagnostic context specific to the error (e.g., user IDs, input values).
   * This is embedded in the error and serialized with it.
   */
  readonly context?: ErrorContext;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly formErrors?: readonly string[];
  /**
   * Optional message override.
   * If not provided, the default message for the error code is used.
   */
  readonly message?: string;
}
