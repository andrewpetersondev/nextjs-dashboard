// File: src/shared/core/result/app-error.ts
import type { ErrorCode, Severity } from "@/shared/errors/error-codes";

/**
 * Canonical, JSON-safe details payload for AppError.
 * - Brand enforces construction via builders/normalizers.
 * JSON-safe diagnostics and UI payloads.
 *
 * Forms: normalized, framework-agnostic shape.
 * - formErrors: readonly array of non-field messages (may be empty).
 * - fieldErrors: dense map field -> readonly string[] (may be empty arrays).
 * @deprecated Use BaseError and related utilities instead.
 *
 */
export interface AppErrorDetails {
  readonly formErrors?: readonly string[];
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  /** Extensible bag for adapter-safe, JSON-serializable extras */
  readonly extra?: Readonly<Record<string, unknown>>;
  /** Nominal brand to discourage ad-hoc object assignment */
  readonly __brand?: "AppErrorDetails";
}

/**
 * Represents an application-level error with structured information.
 *
 * @public
 * @readonly
 * @remarks Provides clarity on the context and severity of an error.
 * @deprecated Use BaseError and related utilities instead.
 */
export interface AppError {
  readonly code: ErrorCode;
  readonly message: string;
  readonly cause?: unknown;
  /**
   * Canonical, JSON-safe diagnostics payload shared across boundaries.
   * See AppErrorDetails.
   */
  readonly details?: AppErrorDetails;
  readonly kind?: string;
  readonly name?: string;
  readonly severity?: Severity;
  readonly stack?: string;
  readonly __appError?: "AppError";
}
