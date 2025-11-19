import type { LogLevel } from "@/shared/config/env-schemas";
import type { SerializedErrorCause } from "@/shared/errors/base-error.types";

/**
 * Structured log entry format for consistency and JSON parsing.
 */
export interface LogEntry<T = unknown> {
  data?: T;
  level: LogLevel;
  loggerContext?: string;
  message: string;
  pid?: number;
  requestId?: string;
  timestamp: string;
}

/**
 * Operation metadata for DAL/repository pattern logging.
 */
export interface OperationMetadata {
  /** Optional context override (e.g., 'dal.users') */
  context?: string;
  /** Key identifiers for the operation (e.g., { userId: '123' }) */
  identifiers?: Record<string, unknown>;
  /** The operation name (e.g., 'getUserByEmail') */
  operation: string;
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
  detailed?: boolean;
  /** Extra structured fields to merge */
  extra?: Record<string, unknown>;
  /** Force log level override */
  levelOverride?: LogLevel;
  /** Override message (defaults to error.message) */
  message?: string;
}

/**
 * Public safe error shape used when logging arbitrary `unknown` errors.
 *
 * - `string` for primitive / non-Error values
 * - `SerializedErrorCause` for `Error` / `BaseError` instances
 */
export type SafeErrorShape = string | SerializedErrorCause;
