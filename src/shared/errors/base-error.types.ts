import type { ErrorCode, Severity } from "@/shared/errors/error-codes";

/**
 * @public
 * Represents a read-only context object containing error-related metadata.
 * @remarks
 * The keys are strings, and the values are unknown, allowing flexibility for diverse error details.
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
  readonly code: ErrorCode;
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
  readonly message: string;
  readonly name: string;
  readonly stack?: string;
}

/**
 * Shape of a {@link BaseError} when emitted via logging.
 *
 * - Extends {@link BaseErrorJson} with optional diagnostic and debugging fields.
 * - `diagnosticId` is extracted from `context.diagnosticId` when present.
 * - `stack` / `cause` are only included when detailed logging is enabled.
 */
export interface BaseErrorLogPayload extends BaseErrorJson {
  readonly cause?: SerializedErrorCause;
  readonly diagnosticId?: string;
  readonly meta?: Record<string, unknown>;
  readonly stack?: string;
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
  readonly cause?: unknown; // Why is this type unknown when BaseErrorLogPayload.cause is SerializedErrorCause? Look into this.
  readonly context?: ErrorContext;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly formErrors?: readonly string[];
  readonly message?: string;
}
