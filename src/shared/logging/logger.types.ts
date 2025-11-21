// src/shared/logging/logger.types.ts
import type { LogLevel } from "@/shared/config/env-schemas";
import type { BaseErrorJson } from "@/shared/errors/base-error.types";
import type { AppErrorKey, Severity } from "@/shared/errors/error-codes";

type ImmutableRecord = Readonly<Record<string, unknown>>;

type ReservedKeyBlocker = {
  readonly [K in LogReservedKeys]?: never;
};

interface BaseLogEntry {
  readonly logLevel: LogLevel;
  readonly message: string;
  readonly timestamp: string;
}

export interface SerializedErrorCause {
  readonly code?: AppErrorKey;
  readonly message: string;
  readonly name: string;
  readonly severity?: Severity;
  readonly stack?: string;
}

export interface BaseErrorLogPayload extends BaseErrorJson {
  readonly cause?: SerializedErrorCause;
  readonly diagnosticId?: string;
  readonly originalCauseRedacted?: boolean;
  readonly originalCauseType?: string;
  readonly stack?: string;
  readonly validationErrorPresent?: boolean;
}

export type LogReservedKeys = keyof BaseErrorLogPayload;

/**
 * Keys reserved by the error logging system.
 * These keys cannot be used in LoggingContext to prevent overwriting diagnostic data.
 */
export type ProhibitedLogKeys = LogReservedKeys;

/**
 * Ephemeral operational metadata attached at log-time.
 *
 * Contains information about the logging event itself, not the error.
 * Reserved BaseError payload keys are explicitly forbidden.
 */
export type LogEventContext<T extends ImmutableRecord = ImmutableRecord> = T &
  ReservedKeyBlocker;

export type LogMetadata = LogEventContext & {
  readonly correlationId?: string;
  readonly duration?: number;
  readonly loggerContext?: string;
  readonly userId?: string;
};

/**
 * Structured log entry format for consistency and JSON parsing.
 */
export interface StructuredLogEntry extends BaseLogEntry {
  readonly metadata?: LogMetadata;
}

/**
 * Runtime log entry emitted by the logger implementation.
 */
export interface LogEntry<T = unknown> extends BaseLogEntry {
  readonly data?: T;
  readonly loggerContext?: string;
  readonly metadata?: Record<string, unknown>;
  readonly pid?: number;
  readonly requestId?: string;
}

/**
 * Operation metadata for DAL/repository pattern logging.
 */
export interface LogOperationMetadata {
  readonly operationContext?: string;
  readonly operationIdentifiers?: Record<string, unknown>;
  readonly operationName: string;
}

/**
 * Combined data structure for operation logging.
 */
export type LogOperationData<
  T extends Record<string, unknown> = Record<string, unknown>,
> = T & LogOperationMetadata;

/**
 * Options for logging BaseError instances.
 */
export interface LogBaseErrorOptions {
  readonly detailed?: boolean;
  readonly levelOverride?: LogLevel;
  readonly loggingContext?: LogEventContext;
  readonly message?: string;
}

/**
 * Public safe error shape used when logging arbitrary `unknown` errors.
 *
 * - `string` for primitive / non-Error values
 * - `SerializedErrorCause` for `Error` / `BaseError` instances
 */
export type SafeErrorShape = string | SerializedErrorCause;
