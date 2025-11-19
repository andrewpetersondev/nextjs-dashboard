// src/shared/logging/logger.types.ts
import type { LogLevel } from "@/shared/config/env-schemas";
import type {
  BaseErrorLogPayload,
  SerializedErrorCause,
} from "@/shared/errors/base-error.types";

export interface LogMetadata {
  readonly [key: string]: unknown;
  readonly context?: string;
  readonly correlationId?: string;
  readonly duration?: number;
  readonly userId?: string;
}

export interface StructuredLogEntry {
  readonly level: LogLevel;
  readonly message: string;
  readonly metadata?: LogMetadata;
  readonly timestamp: string;
}

export interface Logger {
  debug(message: string, metadata?: LogMetadata): void;
  error(message: string, error?: Error, metadata?: LogMetadata): void;
  info(message: string, metadata?: LogMetadata): void;
  trace(message: string, metadata?: LogMetadata): void;
  warn(message: string, metadata?: LogMetadata): void;
}

/**
 * Keys reserved by the error logging system.
 * These keys cannot be used in LoggingContext to prevent overwriting diagnostic data.
 */
export type ReservedLogKeys = keyof BaseErrorLogPayload;

/**
 * Ephemeral operational metadata attached at log-time.
 *
 * Contains information about the logging event itself, not the error:
 * - Request/correlation identifiers (requestId, correlationId)
 * - Environment/runtime context (hostname, service name, pod name)
 * - Tracing metadata (spanId, traceId)
 * - Deployment context (version, region, environment)
 * - User/session context (userId, sessionId) when not part of error diagnostics
 *
 * This context is transient and specific to where/when/how the log was created.
 * It is merged into the log entry's data payload, not embedded in the error object.
 *
 * @remarks
 * Keys that conflict with BaseErrorLogPayload (like 'code', 'context', 'stack')
 * are explicitly forbidden by the type system.
 *
 * @example
 * ```typescript
 * const loggingContext: LoggingContext = {
 *   requestId: 'req-123',
 *   hostname: 'api-server-1',
 *   environment: 'production',
 *   // context: {} // TS Error: Property 'context' is incompatible with index signature.
 * };
 *
 * logger.logBaseError(error, { loggingContext });
 * // Results in log entry with both error data AND logging context
 */
export type LoggingContext = Readonly<Record<string, unknown>> & {
  readonly [K in ReservedLogKeys]?: never;
};

/**
 * Structured log entry format for consistency and JSON parsing.
 */
export interface LogEntry<T = unknown> {
  data?: T;
  level: LogLevel;
  loggerContext?: string;
  message: string;
  /** Global process-level metadata (version, env, etc) */
  metadata?: Record<string, unknown>;
  pid?: number;
  requestId?: string;
  timestamp: string;
}

/**
 * Operation metadata for DAL/repository pattern logging.
 */
export interface OperationMetadata {
  /** Optional context override (e.g., 'dal.users') */
  operationContext?: string;
  /** Key identifiers for the operation (e.g., { userId: '123' }) */
  operationIdentifiers?: Record<string, unknown>;
  /** The operation name (e.g., 'getUserByEmail') */
  operationName: string;
}

/**
 * Combined data structure for operation logging.
 */
export type OperationData<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & OperationMetadata;

/**
 * Options for logging BaseError instances.
 */
export interface LogBaseErrorOptions {
  /** Include stack + cause chain (defaults false) */
  readonly detailed?: boolean;
  /** Force log level override */
  readonly levelOverride?: LogLevel;
  /** Ephemeral operational metadata attached at log-time */
  readonly loggingContext?: LoggingContext;
  /** Override message (defaults to error.message) */
  readonly message?: string;
}

/**
 * Public safe error shape used when logging arbitrary `unknown` errors.
 *
 * - `string` for primitive / non-Error values
 * - `SerializedErrorCause` for `Error` / `BaseError` instances
 */
export type SafeErrorShape = string | SerializedErrorCause;
