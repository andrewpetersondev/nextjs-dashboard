// src/shared/errors/base-error.types.ts
import type { AppErrorCode, Severity } from "@/shared/errors/error-codes";

// JSON-safe value types for error contexts
type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { readonly [key: string]: JsonValue };

export interface JsonObject {
  readonly [key: string]: JsonValue;
}

/**
 * Canonical metadata shared by all serialized error shapes.
 */
export interface CanonicalErrorMetadata {
  readonly category: string;
  readonly code: AppErrorCode;
  readonly description: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly severity: Severity;
  readonly statusCode: number;
}

export interface SerializedError
  extends Pick<CanonicalErrorMetadata, "code" | "message" | "statusCode"> {
  readonly context?: ErrorContext;
  readonly name: string;
  readonly timestamp: string;
}

/**
 * Immutable diagnostic context embedded directly on errors.
 *
 * Design note:
 *  - We intentionally allow `unknown` values to reduce friction at call sites
 *    (e.g., Dates, domain entities). In development, `BaseError` sanitizes
 *    context to be JSON-serializable and redacts non-serializable values.
 *  - In production, the context object is frozen as-is for performance.
 *    Downstream serializers should handle non-JSON types if present.
 */
export type ErrorContext = Readonly<Record<string, unknown>>;

export interface BaseErrorJson extends CanonicalErrorMetadata {
  readonly context?: ErrorContext;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly formErrors?: readonly string[];
}

export interface SerializedErrorCause {
  readonly code?: AppErrorCode;
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

export interface BaseErrorOptions {
  readonly cause?: unknown;
  readonly context?: ErrorContext;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly formErrors?: readonly string[];
  readonly message?: string;
}
