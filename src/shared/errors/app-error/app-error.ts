// File: src/shared/core/result/app-error.ts

import { isProd } from "@/shared/config/env-shared";
import type { BaseError } from "@/shared/errors/base-error";
import {
  type ErrorCode,
  type Severity,
  tryGetErrorCodeMeta,
} from "@/shared/errors/error-codes";

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

// Factory helpers (kept minimal here to avoid cyclic deps with builders)

/** Create branded details; call sites can pass partials safely. */
export const makeAppErrorDetails = (
  d: Readonly<{
    formErrors?: readonly string[];
    fieldErrors?: Readonly<Record<string, readonly string[]>>;
    extra?: Readonly<Record<string, unknown>>;
  }>,
): AppErrorDetails => {
  const details: AppErrorDetails = {
    ...(d.formErrors ? { formErrors: d.formErrors } : {}),
    ...(d.fieldErrors ? { fieldErrors: d.fieldErrors } : {}),
    ...(d.extra ? { extra: d.extra } : {}),
    __brand: "AppErrorDetails",
  };
  return Object.freeze(details);
};

/**
 * Create an AppError for a specific canonical code using BaseError semantics,
 * then adapt to AppError. Useful when you know the code at the boundary.
 * @deprecated Use BaseError and related utilities instead.
 */
export function appErrorFromCode(
  code: BaseError["code"],
  message?: string,
  details?: unknown,
): AppError {
  const meta = tryGetErrorCodeMeta(code);
  const app: AppError = {
    code,
    kind: meta?.category ?? "unknown",
    message: message || meta?.description || "An unknown error occurred",
    severity: (meta?.severity as AppError["severity"] | undefined) ?? "error",
    ...(details ? { details } : {}),
  };
  if (!isProd()) {
    Object.freeze(app);
  }
  return app;
}
