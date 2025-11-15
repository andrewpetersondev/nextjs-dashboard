import type { LogLevel } from "@/shared/config/env-schemas";
import type {
  BaseErrorLogPayload,
  SerializedErrorCause,
} from "@/shared/errors/base-error";

/**
 * Structured log entry format for consistency and JSON parsing.
 */
export interface LogEntry<T = unknown> {
  level: LogLevel;
  message: string;
  context?: string;
  timestamp: string;
  data?: T;
  pid?: number;
  requestId?: string;
}

/**
 * Operation metadata for DAL/repository pattern logging.
 */
export interface OperationMetadata {
  /** The operation name (e.g., 'getUserByEmail') */
  operation: string;
  /** Optional context override (e.g., 'dal.users') */
  context?: string;
  /** Key identifiers for the operation (e.g., { userId: '123' }) */
  identifiers?: Record<string, unknown>;
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
  /** Override message (defaults to error.message) */
  message?: string;
  /** Extra structured fields to merge */
  extra?: Record<string, unknown>;
  /** Include stack + cause chain (defaults false) */
  detailed?: boolean;
  /** Force log level override */
  levelOverride?: LogLevel;
}

/**
 * Enriched error payload for detailed BaseError logging.
 *
 * Uses the canonical {@link BaseErrorLogPayload} from the errors module.
 */
export type DetailedErrorPayload = BaseErrorLogPayload;

/**
 * Public safe error shape used when logging arbitrary `unknown` errors.
 *
 * - `string` for primitive / non-Error values
 * - `SerializedErrorCause` for `Error` / `BaseError` instances
 */
export type SafeErrorShape = string | SerializedErrorCause;
