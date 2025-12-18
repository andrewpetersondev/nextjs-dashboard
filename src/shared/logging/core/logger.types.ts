import type { LogLevel } from "@/shared/config/env-schemas";
import type { AppErrorKey } from "@/shared/errors/catalog/app-error.registry";
import type { Severity } from "@/shared/errors/core/app-error.schema";
import type { AppErrorJson } from "@/shared/errors/core/app-error.types";

export type ImmutableRecord = Readonly<Record<string, unknown>>;

export interface BaseLogEntry {
  readonly logLevel: LogLevel;
  readonly message: string;
  readonly timestamp: string;
}

/**
 * JSON-serializable representation of a standard Error object.
 */
export interface SerializedError {
  readonly code?: AppErrorKey;
  readonly message: string;
  readonly name: string;
  readonly severity?: Severity;
  readonly stack?: string;
}

export interface BaseErrorLogPayload extends AppErrorJson {
  readonly cause?: SerializedError;
  readonly diagnosticId?: string;
  readonly originalCauseRedacted?: boolean;
  readonly originalCauseType?: string;
  readonly stack?: string;
  readonly validationErrorPresent?: boolean;
}

/**
 * Ephemeral operational metadata attached at log-time.
 */
export type LogEventContext<T extends object = ImmutableRecord> = T;

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
export type LogOperationData<T extends object = Record<string, unknown>> = T &
  LogOperationMetadata;

/**
 * Options for logging AppError instances.
 */
export interface LogBaseErrorOptions {
  readonly levelOverride?: LogLevel;
  readonly loggingContext?: LogEventContext;
  readonly message?: string;
}

/**
 * Public safe error shape used when logging arbitrary `unknown` errors.
 */
export type SafeErrorShape = string | SerializedError;
