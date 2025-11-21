// src/shared/errors/base-error.types.ts
import type { AppErrorKey, Severity } from "@/shared/errors/error-codes";

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
  readonly code: AppErrorKey;
  readonly description: string;
  readonly message: string;
  readonly retryable: boolean;
  readonly severity: Severity;
  readonly statusCode: number;
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

/**
 * Options for constructing a BaseError.
 *
 * - `cause` is the original thrown value or underlying error.
 * - `context` is a small, diagnostic object (non-logging) describing where/why.
 * - `fieldErrors` / `formErrors` are reserved for validation-like errors.
 *   They are always cloned & frozen by BaseError; callers may pass plain
 *   mutable objects/arrays.
 */
export interface BaseErrorOptions {
  /**
   * Original thrown value or underlying cause.
   *
   * If this is an `Error`, it is passed through as `Error.cause`.
   * Otherwise it is redacted into a JSON-safe shape.
   */
  readonly cause?: unknown;

  /**
   * Diagnostic context describing the failure in domain terms.
   *
   * Should NOT contain logging metadata (request ids, hostnames, etc.);
   * keep that in the logging layer instead.
   */
  readonly context?: ErrorContext;

  /**
   * Per-field error messages, typically for validation failures.
   *
   * Keys are field names; values are one or more human-readable codes/messages.
   */
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;

  /**
   * Form-level (non-field-specific) error messages.
   */
  readonly formErrors?: readonly string[];

  /**
   * Message to use instead of the canonical code description.
   */
  readonly message?: string;
}
